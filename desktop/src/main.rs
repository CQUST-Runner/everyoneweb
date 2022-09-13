#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use core::time;

#[cfg(windows)]
use std::os::windows::process::CommandExt;

use std::{
    path::PathBuf,
    process::{self as proc, Command},
    thread::sleep,
};

use log::{error, info};
use sysinfo::{ProcessExt, SystemExt};
use tauri::{CustomMenuItem, Menu, MenuItem, PathResolver, Submenu};
use tauri_plugin_log::{LogTarget, LoggerBuilder};

#[tauri::command]
async fn hello_world_command(_app: tauri::AppHandle) -> Result<String, String> {
    println!("I was invoked from JS!");
    Ok("Hello world from Tauri!".into())
}

fn check_server_is_on() {
    let mut i = 0;
    while i < 5 {
        info!("waiting server to start");
        let resp = reqwest::blocking::get("http://localhost:16224/app");

        match resp {
            Ok(r) => {
                if r.status().as_u16() == 200 {
                    break;
                }
                info!("{}", r.status());
            }
            Err(err) => {
                info!("{}", err.to_string())
            }
        }

        i = i + 1;
        sleep(time::Duration::new(1, 0));
    }
}

#[cfg(unix)]
fn set_creation_flags(cmd: &mut Command) -> &mut Command {
    return cmd;
}

#[cfg(windows)]
fn set_creation_flags(cmd: &mut Command) -> &mut Command {
    let mut flags: u32 = 0;
    flags |= 0x08000000; // CREATE_NO_WINDOW
    return cmd.creation_flags(flags);
}

fn start_server(exe_path: PathBuf, p: &PathResolver) {
    let metadata = std::fs::metadata(exe_path.clone());
    if metadata.is_err() {
        error!(
            "get metadata of server executable failed:{:?}",
            metadata.unwrap_err()
        );
        return;
    }

    let mtime = metadata.unwrap().modified();
    if mtime.is_err() {
        error!("get modified time failed:{:?}", mtime.unwrap_err());
        return;
    }

    let unix = mtime.unwrap().duration_since(std::time::UNIX_EPOCH);
    if unix.is_err() {
        error!("get unix timestamp failed:{:?}", unix.unwrap_err());
        return;
    }
    // modification time as process's `-id` argument
    let current_id = unix.unwrap().as_secs().to_string();

    let mut sys = sysinfo::System::new();
    sys.refresh_processes();
    let result = sys.processes_by_name("offliner-server");
    let mut count: i32 = 0;
    for p in result {
        let cmd = p.cmd();
        info!("found server process:{:?}", cmd);
        let mut id_found = false;
        let mut id: String = String::from("not found");
        for token in cmd {
            if id_found {
                id = String::from(token);
                break;
            }
            if token == "-id" {
                id_found = true;
            }
        }
        if id == "not found" || id != current_id {
            info!("kill old version server, pid {}", p.pid());
            // TODO: more soft
            p.kill();
        } else {
            count += 1;
        }
    }
    if count > 0 {
        info!("server is running");
        return;
    }

    let config_dir = p.app_dir();
    let log_dir = p.log_dir();
    if config_dir.is_none() {
        return;
    }
    if log_dir.is_none() {
        return;
    }

    info!("server not running, spawn");
    let program = exe_path.clone().canonicalize().unwrap();
    let mut cmd = &mut proc::Command::new(program);
    cmd = cmd
        .arg("-config")
        .arg(config_dir.unwrap().join("config.yaml"))
        .arg("-log")
        .arg(log_dir.unwrap().join("offliner-server.log"))
        .arg("-id")
        .arg(current_id)
        .current_dir(exe_path.parent().unwrap());
    cmd = set_creation_flags(cmd);
    cmd.spawn().expect("spawn server failed");
}

fn main() {
    // https://github.com/tauri-apps/tauri/issues/1055#issuecomment-1008895581
    let about_menu = Submenu::new(
        "App",
        Menu::new()
            .add_native_item(MenuItem::Hide)
            .add_native_item(MenuItem::HideOthers)
            .add_native_item(MenuItem::ShowAll)
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Quit)
            .add_item(CustomMenuItem::new("CompletelyQuit", "Completely Quit")),
    );

    let edit_menu = Submenu::new(
        "Edit",
        Menu::new()
            .add_native_item(MenuItem::Undo)
            .add_native_item(MenuItem::Redo)
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Cut)
            .add_native_item(MenuItem::Copy)
            .add_native_item(MenuItem::Paste)
            .add_native_item(MenuItem::SelectAll),
    );

    let view_menu = Submenu::new(
        "View",
        Menu::new().add_native_item(MenuItem::EnterFullScreen),
    );

    let window_menu = Submenu::new(
        "Window",
        Menu::new()
            .add_native_item(MenuItem::Minimize)
            .add_native_item(MenuItem::Zoom),
    );

    let help_menu = Submenu::new(
        "Help",
        Menu::new()
            .add_item(CustomMenuItem::new(
                "InstallExtension",
                "Install Browser Extension",
            ))
            .add_item(CustomMenuItem::new("Restart", "Restart Server"))
            .add_item(CustomMenuItem::new("Reload", "Reload Window"))
            .add_item(CustomMenuItem::new("DevTools", "Toggle Dev Tools"))
            .add_item(CustomMenuItem::new("OpenInBrower", "Open In Broswer"))
            .add_item(CustomMenuItem::new("Learn More", "Learn More")),
    );

    let menu = Menu::new()
        .add_submenu(about_menu)
        .add_submenu(edit_menu)
        .add_submenu(view_menu)
        .add_submenu(window_menu)
        .add_submenu(help_menu);
    tauri::Builder::default()
        .plugin(
            LoggerBuilder::default()
                .targets([LogTarget::LogDir, LogTarget::Stdout, LogTarget::Webview])
                .build(),
        )
        .setup(|app| {
            let r = app.path_resolver();
            let server = r.resolve_resource("../build/server");
            if server.is_some() {
                let server_path = server.unwrap();
                info!("server path is {}", server_path.display().to_string());
                if cfg!(windows) {
                    start_server(server_path.join("offliner-server.exe"), &r);
                } else if cfg!(unix) {
                    start_server(server_path.join("offliner-server"), &r);
                }
                check_server_is_on();
            }

            Ok(())
        })
        .menu(menu)
        .on_menu_event(|event| {
            let event_name = event.menu_item_id();
            match event_name {
                _ => {}
            }
        })
        .invoke_handler(tauri::generate_handler![hello_world_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
