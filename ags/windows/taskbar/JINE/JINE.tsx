import { createComputed, createState } from "ags";
import { Astal, Gdk, Gtk } from "ags/gtk4";
import app from "ags/gtk4/app";
import { execAsync } from "ags/process";
import GLib from "gi://GLib?version=2.0";
import { setJineLauncherVisible } from "../jineLauncherState";


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
            <box class="jine-box" orientation={Gtk.Orientation.VERTICAL}>
                <centerbox class="jine-header">
                    <box $type="start">
                        <label label="■" css={"margin-bottom: 2px; padding-left: 2px; padding-top: 4px; padding-right: 2px;"}></label>
                        <label label="JINE" css={"margin-bottom: -2px; padding-right: 8px; padding-left: 8px;"}></label>
                    </box>
                    <box class="jine-button-box" $type="end">
                        <button class="jine-minimize-button" onClicked={() => {
                            execAsync(`ags toggle jine-${gdkmonitor.connector}`);
                        }}>
                            <image file={"./images/button_minimize.png"} pixelSize={18}></image>
                        </button>
                        <button class="jine-maximize-button" onClicked={() => {
                            setMaximized(!isMaximized());
                        }}>
                            <image file={"./images/button_maximize.png"} pixelSize={18}></image>
                        </button>
                        <button class="jine-close-button" onClicked={() => {
                            setJineLauncherVisible(gdkmonitor.connector, false);
                            execAsync(`ags toggle jine-${gdkmonitor.connector}`);
                        }}>
                            <image file={"./images/button_close.png"} pixelSize={18}></image>
                        </button>
                    </box>
                </centerbox>

                <box class="jine-content-box" css={`background-image: url("file://${GLib.get_user_config_dir()}/ags/images/JINE/JINEBGtiled.png");`} vexpand={true}>
                </box>
            </box>
        </window>
    )

}