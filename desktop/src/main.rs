#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use core::time;

#[cfg(windows)]
use std::os::windows::process::CommandExt;

use std::{
    path::PathBuf,
    process::{self as proc, exit, Command},
    thread::sleep,
};

use log::{error, info};
use sysinfo::{ProcessExt, SystemExt};
use tauri::{
    api::{process::restart, shell::open},
    CustomMenuItem, Manager, Menu, MenuItem, PathResolver, Submenu, WindowMenuEvent,
};
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

fn close_server() {
    let mut sys = sysinfo::System::new();
    sys.refresh_processes();
    let result = sys.processes_by_name("everyoneweb-server");
    for p in result {
        // TODO: more gentle
        p.kill();
    }
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
    info!("current id is {:?}", current_id);

    let mut sys = sysinfo::System::new();
    sys.refresh_processes();
    let result = sys.processes_by_name("everyoneweb-server");
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
            info!("kill old version server, pid {}, id {}", p.pid(), id);
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
        .arg(log_dir.unwrap().join("everyoneweb-server.log"))
        .arg("-id")
        .arg(current_id)
        .current_dir(exe_path.parent().unwrap());
    cmd = set_creation_flags(cmd);
    cmd.spawn().expect("spawn server failed");
    sleep(time::Duration::new(0, 200000000)); // 200ms
}

fn handle_menu_event(event: WindowMenuEvent) {
    match event.menu_item_id() {
        "CompletelyQuit" => {
            close_server();
            sleep(time::Duration::new(0, 200000000)); // 200ms
            exit(0);
        }
        "InstallExtension" => {
            let _ = open(
                &event.window().app_handle().shell_scope(),
                "https://chrome.google.com/webstore/category/extensions",
                None,
            );
        }
        "Restart" => {
            // TODO: only restart server
            close_server();
            sleep(time::Duration::new(0, 200000000)); // 200ms
            restart(&event.window().app_handle().env());
        }
        "DevTools" => {
            if !event.window().is_devtools_open() {
                event.window().open_devtools();
            } else {
                event.window().close_devtools();
            }
        }
        "OpenInBrower" => {
            let _ = open(
                &event.window().app_handle().shell_scope(),
                "http://localhost:16224/app",
                None,
            );
        }
        "LearnMore" => {
            let _ = open(
                &event.window().app_handle().shell_scope(),
                "https://github.com/CQUST-Runner/everyoneweb",
                None,
            );
        }
        _ => {}
    }
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
            .add_item(
                CustomMenuItem::new("CompletelyQuit", "完全退出（包括服务）")
                    .accelerator("Ctrl+Cmd+Q"),
            ),
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

    let dev_tool_title;
    if cfg!(windows) {
        dev_tool_title = String::from("打开开发者工具");
    } else {
        dev_tool_title = String::from("切换开发者工具")
    }
    let help_menu = Submenu::new(
        "Help",
        Menu::new()
            .add_item(
                CustomMenuItem::new("InstallExtension", "安装浏览器插件").accelerator("Cmd+I"),
            )
            .add_item(CustomMenuItem::new("Restart", "重启服务").accelerator("Cmd+R"))
            .add_item(CustomMenuItem::new("DevTools", dev_tool_title).accelerator("F12"))
            .add_item(CustomMenuItem::new("OpenInBrower", "在浏览器中访问").accelerator("Cmd+O"))
            .add_item(CustomMenuItem::new("LearnMore", "教程").accelerator("Cmd+L")),
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
                    start_server(server_path.join("everyoneweb-server.exe"), &r);
                } else if cfg!(unix) {
                    start_server(server_path.join("everyoneweb-server"), &r);
                }
                check_server_is_on();
            }

            Ok(())
        })
        .menu(menu)
        .on_menu_event(|event| {
            handle_menu_event(event);
        })
        .invoke_handler(tauri::generate_handler![hello_world_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
