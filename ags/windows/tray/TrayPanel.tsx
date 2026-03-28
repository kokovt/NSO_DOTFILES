import app from "ags/gtk4/app";
import Astal from "gi://Astal?version=4.0";
import Gtk from "gi://Gtk?version=4.0";
import Gdk from "gi://Gdk?version=4.0";
import { For, createBinding } from "ags";
import { execAsync } from "ags/process";
import AstalTray from "gi://AstalTray";

function trayItemInit(btn: Gtk.MenuButton, item: AstalTray.TrayItem) {
    btn.menuModel = item.menuModel
    btn.insert_action_group("dbusmenu", item.actionGroup)
    item.connect("notify::action-group", () => {
        btn.insert_action_group("dbusmenu", item.actionGroup)
    })
}

export default function TrayPanel({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
    const { BOTTOM, RIGHT } = Astal.WindowAnchor
    const { OVERLAY } = Astal.Layer
    const tray = AstalTray.get_default()
    const items = createBinding(tray, "items")
    const panelName = `tray-panel-${gdkmonitor.connector}`

    return (
        <window
            namespace="tray-panel"
            name={panelName}
            gdkmonitor={gdkmonitor}
            anchor={BOTTOM | RIGHT}
            layer={Astal.Layer.OVERLAY}
            application={app}
            class="tray-panel-window"
            keymode={Astal.Keymode.ON_DEMAND}
            exclusivity={Astal.Exclusivity.IGNORE}
            visible={false}
            marginRight={8}>
            <box class="tray-popover-box" orientation={Gtk.Orientation.VERTICAL}>
                <Gtk.FlowBox
                    class="tray-popover-flow"
                    maxChildrenPerLine={6}
                    homogeneous
                    selectionMode={Gtk.SelectionMode.NONE}
                    rowSpacing={1}
                    columnSpacing={1}>
                    <For each={items}>
                        {(item) => (
                            <menubutton class="tray-popover-item" $={(self) => trayItemInit(self, item)}>
                                <image
                                    class="tray-popover-icon"
                                    gicon={createBinding(item, "gicon")}
                                    pixelSize={12}
                                    tooltipText={createBinding(item, "tooltip_text") as any}
                                />
                            </menubutton>
                        )}
                    </For>
                </Gtk.FlowBox>
            </box>
        </window>
    )
}

export function TrayCloser({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
    const { BOTTOM, LEFT, TOP, RIGHT } = Astal.WindowAnchor

    function onClick() {
        execAsync(`ags toggle tray-panel-${gdkmonitor.connector}`)
        execAsync(`ags toggle tray-panel-closer-${gdkmonitor.connector}`)
    }

    return (
        <window
            namespace="tray-panel"
            name={`tray-panel-closer-${gdkmonitor.connector}`}
            gdkmonitor={gdkmonitor}
            anchor={BOTTOM | LEFT | TOP | RIGHT}
            application={app}
            class="closer"
            visible={false}>
            <Gtk.GestureClick onPressed={onClick} />
        </window>
    )
}
