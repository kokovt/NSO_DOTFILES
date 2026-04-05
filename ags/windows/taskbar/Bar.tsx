import app from "ags/gtk4/app";
import Astal from "gi://Astal?version=4.0";
import GLib from "gi://GLib?version=2.0";
import Gtk from "gi://Gtk?version=4.0";
import { createPoll } from "ags/time";
import { createBinding, createComputed, createEffect, createState } from "ags"
import Gdk from "gi://Gdk?version=4.0";
import AstalBattery from "gi://AstalBattery"
import { execAsync } from "ags/process";
import AstalHyprland from "gi://AstalHyprland";
import { jineLauncherByMonitor, setJineLauncherVisible } from "./jineLauncherState";

//! Clock is heavily modified from AGSv2 examples.
//? The format is DAY Y XX:XX (XXXDAY)
function Clock({ format = "Day %d %H:%M (%A)" }) {
    const time = createPoll("", 1000, () => {
        return GLib.DateTime.new_now_local().format(format)?.toLocaleUpperCase();
    });

    //? There is no ingame morning image, so I guess noon starts at 10.... (Holy shi Ame you're great but PLEASE FIX YOUR DAMN SLEEP SCHEDULE)
    //? The rest are meant to be as close to the actual "generic" definitions of the times.
    const imagePoll = createPoll("", 1000, () => {
        let hour = Number(GLib.DateTime.new_now_local().format("%H"));
        let image = "";

        if (hour >= 21 || hour < 10) {
            image = "./images/icon_watch_night.png";
        } else if (hour > 10 && hour < 17) {
            image = "./images/icon_watch_noon.png";
        } else {
            image = "./images/icon_watch_evening.png"
        }
        return image;
    })

    return (
        <menubutton class="calendar-button">
            <box class="date-box">
                <image class="time-image" file={imagePoll} pixelSize={20} />
                <label label={time as any} />
            </box>
            <popover>
                //TODO Make this my own related to the game. This calendar feels USELESS.
                //* I mean it doesn't even reset to todays date ever....
                <Gtk.Calendar />
            </popover>
        </menubutton>
    )
}

function BatteryIndicator() {
    const device = AstalBattery.Device.get_default()

    if (!device) {
        return <box />
    }

    const batteryIcon = createBinding(device, "battery_icon_name")
    const percentage = createBinding(device, "percentage")
    const pctLabel = createComputed(() => `${Math.round(percentage() * 100)}%`)

    return (
        <box class="battery-box" visible={device.isBattery}>
            <image class="battery-image" iconName={batteryIcon as any} pixelSize={20} />
            <label label={pctLabel as any} class="battery-text" />
        </box>
    )
}

//! Make AGS window for the settings menu.
//? This is harder to figure out than expected....
function StartButton() {
    return (
        <button class="start-button" onClicked={() => {
            const monitor = AstalHyprland.get_default().get_focused_monitor().get_name();
            execAsync(`ags toggle start-menu-${monitor}`);
            execAsync(`ags toggle start-menu-closer-${monitor}`);
        }}>
            <box class="start-box">
                <image class="start-image" file="./images/button_start.png" pixelSize={35} />
                <label class="start-text" label={"START"} />
            </box>
        </button>
    )
}

//TODO Reimplement the tweeter from in game.
function TweeterButton() {
    return (
        <button onClicked={() => {
            execAsync("xdg-open https://x.com");
            return;
        }} class="game-buttons">
            <image file="./images/icon_taskbar_poketter.png" pixelSize={25}></image>
        </button>
    )
}

//? Pixel Jine: opens JINE + bar launcher when the window is hidden; no-op while it is open.
function JineButton({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
    const name = `jine-${gdkmonitor.connector}`;
    return (
        <button onClicked={() => {
            const w = app.get_window(name) as Gtk.Window | null;
            if (w?.visible) return;
            setJineLauncherVisible(gdkmonitor.connector, true);
            execAsync(`ags toggle ${name}`);
        }} class="game-buttons">
            <image file="./images/icon_taskbar_jine.png" pixelSize={25}></image>
        </button>
    )
}

function JineBarLauncher({
    gdkmonitor,
    visible,
}: {
    gdkmonitor: Gdk.Monitor;
    visible: () => boolean;
}) {
    const c = gdkmonitor.connector;
    const winName = `jine-${c}`;
    const [jineWinVisible, setJineWinVisible] = createState(false);

    createEffect(() => {
        const sync = () => {
            const w = app.get_window(winName);
            if (w) setJineWinVisible(w.visible);
            else setJineWinVisible(false);
        };
        sync();
        const idToggle = app.connect("window-toggled", (_src, win: Gtk.Window) => {
            if (win.name === winName) setJineWinVisible(win.visible);
        });
        const lateSync = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 250, () => {
            sync();
            return GLib.SOURCE_REMOVE;
        });
        return () => {
            app.disconnect(idToggle);
            GLib.source_remove(lateSync);
        };
    });

    const launcherBoxClass = createComputed(() =>
        jineWinVisible()
            ? "jine-launcher-box jine-launcher-look-embedded"
            : "jine-launcher-box jine-launcher-look-popout",
    );

    return (
        <button
            class="jine-launcher-button"
            visible={visible as any}
            onClicked={() => {
                execAsync(`ags toggle jine-${c}`);
            }}>
            <box class={launcherBoxClass as any}>
                <label label="■" class="jine-launcher-square" />
                <label label="JINE" class="jine-launcher-title" />
            </box>
        </button>
    );
}

//TODO Add custom task manager 
function TaskManager() {
    return (
        <button onClicked={() => {
            execAsync("corectrl");
            return;
        }} class="game-buttons">
            <image file="./images/icon_taskbar_taskmanager.png" pixelSize={25}></image>
        </button>
    )
}

//! Toggles layer-shell tray window + fullscreen closer (same pattern as start menu).
function TrayToggle({ connector }: { connector: string }) {
    const panelName = `tray-panel-${connector}`
    const [trayOpen, setTrayOpen] = createState(false)

    createEffect(() => {
        const sync = () => {
            const w = app.get_window(panelName)
            if (w) setTrayOpen(w.visible)
        }
        sync()
        const idToggle = app.connect("window-toggled", (_src, win: Gtk.Window) => {
            if (win.name === panelName) setTrayOpen(win.visible)
        })
        const lateSync = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 250, () => {
            sync()
            return GLib.SOURCE_REMOVE
        })
        return () => {
            app.disconnect(idToggle)
            GLib.source_remove(lateSync)
        }
    })

    const arrowIcon = createComputed(() =>
        trayOpen() ? "pan-down-symbolic" : "pan-up-symbolic",
    )

    return (
        <button
            class="tray-toggle-button"
            onClicked={() => {
                execAsync(`ags toggle ${panelName}`)
                execAsync(`ags toggle tray-panel-closer-${connector}`)
            }}>
            <box class="tray-toggle-inner">
                <image class="tray-toggle-arrow" iconName={arrowIcon as any} pixelSize={10} />
            </box>
        </button>
    )
}

//* Just an empty box to work as the divider between the jine icons and everything else.
function Divider() {
    return (
        <box class="divider" />
    )
}

//? Main bar function
export function Bar({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
    const { BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor;
    let win: Astal.Window;
    const jineLauncherShown = createComputed(
        () => jineLauncherByMonitor()[gdkmonitor.connector] ?? false,
    );

    return (
        <window $={(self) => (win = self)}
            visible
            namespace="my-bar"
            name={`bar-${gdkmonitor.connector}`}
            gdkmonitor={gdkmonitor}
            exclusivity={Astal.Exclusivity.EXCLUSIVE}
            anchor={BOTTOM | LEFT | RIGHT}
            application={app}
            class="main-bar"
            layer={Astal.Layer.BACKGROUND}>
            <centerbox>
                <box $type="start">
                    <StartButton />
                    <Divider />
                    <TweeterButton />
                    <JineButton gdkmonitor={gdkmonitor} />
                    <TaskManager />
                    <Divider />
                    <label label="In development~" class="dev-text" />
                    <JineBarLauncher gdkmonitor={gdkmonitor} visible={jineLauncherShown} />
                </box>
                <box $type="end">
                    <TrayToggle connector={gdkmonitor.connector} />
                    <BatteryIndicator />
                    <Clock />
                </box>
            </centerbox>
        </window>
    )
}