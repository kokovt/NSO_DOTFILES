import app from "ags/gtk4/app";
import Astal from "gi://Astal?version=4.0";
import GLib from "gi://GLib?version=2.0";
import Gtk from "gi://Gtk?version=4.0";
import { createPoll } from "ags/time";
import Gdk from "gi://Gdk?version=4.0";
import { execAsync } from "ags/process";

function Clock({ format = "Day %d %H:%M (%A)" }) {
    const time = createPoll("", 1000, () => {
        return GLib.DateTime.new_now_local().format(format)?.toLocaleUpperCase();
    });


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
                <image class="image" file={imagePoll} pixelSize={20} />
                <label label={time as any} />
            </box>
            <popover>
                <Gtk.Calendar />
            </popover>
        </menubutton>
    )
}

function StartButton() {
    return (
        <menubutton class="start-button">
            <box class="start-box">
                <image class="start-image" file="./images/button_start.png" pixelSize={25} />
                <label class="start-text" label={"START"} />
            </box>
        </menubutton>
    )
}

//! Reimplement the tweeter from in game.
function TweeterButton() {
    return (
        <button onClicked={() => {
            execAsync("zen-browser x.com");
            return;
        }} class="tweeter">
            <image file="./images/icon_taskbar_poketter.png" pixelSize={25}></image>
        </button>
    )
}

//! Reimplement the tweeter from in game.
function JineButton() {
    return (
        <button onClicked={() => {
            execAsync("discord");
            return;
        }} class="tweeter">
            <image file="./images/icon_taskbar_jine.png" pixelSize={25}></image>
        </button>
    )
}

//! Add custom task manager 
function TaskManager() {
    return (
        <button onClicked={() => {
            execAsync("corectrl");
            return;
        }} class="tweeter">
            <image file="./images/icon_taskbar_taskmanager.png" pixelSize={25}></image>
        </button>
    )
}

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
            application={app}>
            <centerbox>
                <box $type="start">
                    <StartButton />
                    <box class="something" />
                    <TweeterButton />
                    <JineButton />
                    <TaskManager />
                    <box class="something" />
                </box>
                <box $type="end">
                    <Clock />
                </box>
            </centerbox>
        </window>
    )
}