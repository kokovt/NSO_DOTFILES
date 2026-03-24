import app from "ags/gtk4/app";
import Astal from "gi://Astal?version=4.0";
import GLib from "gi://GLib?version=2.0";
import Gtk from "gi://Gtk?version=4.0";
import { createPoll } from "ags/time";
import { For, createBinding } from "ags"
import Gdk from "gi://Gdk?version=4.0";
import { exec, execAsync } from "ags/process";
import AstalTray from "gi://AstalTray"
import AstalHyprland from "gi://AstalHyprland";
import Cairo from "cairo";


//? Helper functions
function createLabel(item: any) {
    let text = item.title;

    if (text == "" || text == undefined) {
        text = item.tooltip_text;
    }
    return text;
}


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

//TODO Reimplement the jine from in game.
function JineButton() {
    return (
        <button onClicked={() => {
            execAsync("discord");
            return;
        }} class="game-buttons">
            <image file="./images/icon_taskbar_jine.png" pixelSize={25}></image>
        </button>
    )
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

//! Tray is heavily modified from AGSv2 examples.
//* Shows as application names, since apps cant be minimized.
function Tray() {
    const tray = AstalTray.get_default()
    const items = createBinding(tray, "items")

    const init = (btn: Gtk.MenuButton, item: AstalTray.TrayItem) => {
        btn.menuModel = item.menuModel
        btn.insert_action_group("dbusmenu", item.actionGroup)
        item.connect("notify::action-group", () => {
            btn.insert_action_group("dbusmenu", item.actionGroup)
        })
    }

    return (
        <box class="tray-holder">
            <For each={items}>
                {(item) => (
                    <menubutton class="tray-button" $={(self) => init(self, item)}>
                        <box>
                            <image gicon={createBinding(item, "gicon")} class="tray-icon" />
                            <label label={createLabel(item)} />
                        </box>
                    </menubutton>
                )}
            </For>
        </box>
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
            layer={Astal.Layer.BOTTOM}>
            <centerbox>
                <box $type="start">
                    <StartButton />
                    <Divider />
                    <TweeterButton />
                    <JineButton />
                    <TaskManager />
                    <Divider />
                    <label label="In development~" class="dev-text" />
                    <Divider />
                    <Tray />
                </box>
                <box $type="end">
                    <Clock />
                </box>
            </centerbox>
        </window>
    )
}