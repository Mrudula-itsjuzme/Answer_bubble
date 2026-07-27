// Prevents additional console window on Windows in release builds
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            if let Some(overlay_window) = app.get_webview_window("overlay") {
                // Ensure overlay window remains on top, transparent, and floating
                let _ = overlay_window.set_always_on_top(true);
                let _ = overlay_window.set_shadow(true);
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running answer-bubble desktop application");
}
