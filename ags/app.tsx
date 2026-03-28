import app from "ags/gtk4/app";
import style from "./styles/main.scss";
import { Bar } from "./windows/taskbar/Bar";
import { createBinding, For, This} from "ags";
import StartMenu, { StartCloser } from "./windows/startMenu/startMenu";
import TrayPanel, { TrayCloser } from "./windows/tray/TrayPanel";

app.start({
    css: style,
    // gtkTheme: "Adwaita",
    main() {
        const monitors = createBinding(app, "monitors");

        return (
            <For each={monitors}>
                {(monitor) => (
                    <This this={app}>
                        <Bar gdkmonitor={monitor} />
                        <StartCloser gdkmonitor={monitor} />
                        <StartMenu gdkmonitor={monitor} />
                        <TrayCloser gdkmonitor={monitor} />
                        <TrayPanel gdkmonitor={monitor} />
                    </This>
                )}
            </For>
        )

    }
})


