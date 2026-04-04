import { createComputed, createState } from "ags";
import { Astal, Gdk, Gtk } from "ags/gtk4";
import app from "ags/gtk4/app";
import { Process } from "ags/process";
import Gio from "gi://Gio?version=2.0";
import GLib from "gi://GLib?version=2.0";


export default function JINE({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
    const { BOTTOM, LEFT, RIGHT, TOP } = Astal.WindowAnchor;

    let [isMaximized, setMaximized] = createState(false);
    const anchor = createComputed(() => isMaximized() ? TOP | LEFT | RIGHT | BOTTOM : TOP | LEFT);

    return (
        <window
            namespace="jine"
            name={`jine-${gdkmonitor.connector}`}
            gdkmonitor={gdkmonitor}
            anchor={anchor}
            //? I want it to be in the background to not conflict with the users apps.
            layer={Astal.Layer.BACKGROUND}
            application={app}
            class="jine"
            keymode={Astal.Keymode.ON_DEMAND}
        >
            //? Should NOT be this hard to set the background image....
            <box class="jine-box" >
                <box class="jine-header">
                    <label label="■" css={"margin-bottom: 2px; padding-left: 2px; padding-top: 4px; padding-right: 2px;"}></label>
                    <label label="JINE" css={"margin-bottom: -2px; padding-right: 8px; padding-left: 8px;"}></label>
                </box>
            </box>
        </window>
    )

}

//? This is how to set a background image. I just dont have the spot for it right now.
// css={`
//     background-image: url("file://${GLib.get_user_config_dir()}/ags/images/JINE/window.png");
// `}