#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use core::time;
use std::{path::PathBuf, process as proc, thread::sleep};

use log::info;
use sysinfo::SystemExt;
use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};
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
                info!("{}", r.status());
                break;
            }
            Err(err) => {
                info!("{}", err.to_string())
            }
        }

        i = i + 1;
        sleep(time::Duration::new(1, 0));
    }
}

fn start_server(exe_path: PathBuf) {
    let mut sys = sysinfo::System::new();
    sys.refresh_processes();
    let result = sys.processes_by_name("offliner-server");
    if result.count() > 0 {
        info!("server is running");
        return;
    }

    info!("server not running, spawn");
    proc::Command::new(exe_path.clone().canonicalize().unwrap())
        .current_dir(exe_path.parent().unwrap())
        .spawn()
        .expect("spawn server failed");
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
            .add_native_item(MenuItem::Quit),
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
        Menu::new().add_item(CustomMenuItem::new("Learn More", "Learn More")),
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
                start_server(server_path.join("offliner-server"));
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
