import { createState } from "ags";

export const [jineLauncherByMonitor, setJineLauncherByMonitor] = createState<
    Record<string, boolean>
>({});

export function setJineLauncherVisible(connector: string, visible: boolean) {
    const m = jineLauncherByMonitor();
    setJineLauncherByMonitor({ ...m, [connector]: visible });
}
