//* This function is for creating the popup with basic controls in the bottom left.
import app from "ags/gtk4/app";
import Astal from "gi://Astal?version=4.0";
import Gtk from "gi://Gtk?version=4.0";
import Gdk from "gi://Gdk?version=4.0";
import { execAsync } from "ags/process";
import AstalHyprland from "gi://AstalHyprland?version=0.1";

export default function StartMenu({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
    const { BOTTOM, LEFT } = Astal.WindowAnchor;
    let win: Astal.Window;
    const { OVERLAY } = Astal.Layer;

    function onClick() {
        const monitor = AstalHyprland.get_default().get_focused_monitor().get_name();
        execAsync(`ags toggle start-menu-${monitor}`);
        execAsync(`ags toggle start-menu-closer-${monitor}`);
    }


    return (
        <window $={(self) => (win = self)}
            namespace="start-menu"
            name={`start-menu-${gdkmonitor.connector}`}
            gdkmonitor={gdkmonitor}
            // exclusivity={Astal.Exclusivity.IGNORE}
            anchor={BOTTOM | LEFT}
            layer={OVERLAY}
            application={app}
            class="start-menu"
            keymode={Astal.Keymode.ON_DEMAND}>
            <box class="menu-holder">
                <label label="Needy Streamer Overload   ⠿⠿⠿⠿" class="sideways-text" />
                <box class="menu-button-holder" orientation={Gtk.Orientation.VERTICAL}>
                    <button class="menu-button" onClicked={() => {
                        execAsync("xdg-open https://github.com/kokovt/NSO_DOTFILES");
                        onClick();
                    }}>
                        <label label={"Github"} />
                    </button>
                    <button class="menu-button" onClicked={() => {
                        execAsync("kitty");
                        onClick();
                    }}>
                        <label label={"Terminal"} />
                    </button>
                    <button class="menu-button">
                        <label label={"My Pictures"} />
                    </button>
                    <button class="menu-button">
                        <label label={"Control Panel"} />
                    </button>
                    <button class="menu-button" onClicked={() => {
                        execAsync("shutdown -r now");
                    }}>
                        <label label={"Restart"} />
                    </button>
                    <button class="menu-button" onClicked={() => {
                        execAsync("shutdown now");
                    }}>
                        <label label={"Shut down"} />
                    </button>
                </box>
            </box>
        </window>
    )
}


export function StartCloser({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
    const { BOTTOM, LEFT, TOP, RIGHT } = Astal.WindowAnchor;
    let win: Astal.Window;


    function onClick(_e: Gtk.GestureClick, _: number, x: number, y: number) {
        const monitor = AstalHyprland.get_default().get_focused_monitor().get_name();
        execAsync(`ags toggle start-menu-${monitor}`);
        execAsync(`ags toggle start-menu-closer-${monitor}`);
        console.log("monitor");
    }


    return (
        <window $={(self) => (win = self)}
            namespace="start-menu"
            name={`start-menu-closer-${gdkmonitor.connector}`}
            gdkmonitor={gdkmonitor}
            // exclusivity={Astal.Exclusivity.IGNORE}

            anchor={BOTTOM | LEFT | TOP | RIGHT}
            application={app}
            class="closer">
            <Gtk.GestureClick onPressed={onClick} />
        </window>
    )
}