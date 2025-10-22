import { io } from "socket.io-client";
import PLHStore from "./playbackHistoryStore.js";

export default function socket(cookieHeader) {
    const soundpad = new PLHStore(true, true, 100);
    soundpad.init();

    console.log(cookieHeader)
    const socket = io("https://nodes.zed31rus.ru", {extraHeaders: {Cookie: cookieHeader}});

    socket.on("connect", async () => {
        console.log(socket.id);

        //Auth
        socket.emit("auth", (res) => {
        if (!res?.ok) {
            console.error("Auth failed:", res?.message);
            return;
        }
        console.log("Authenticated as", res.user.login);
        });

        //client connected
        socket.on("initStates", async (nodereq, noderes) => {
            const current = await soundpad.getCurrent();
            const history = await soundpad.getHistory();
            const soundList = await soundpad.getSoundListJSON();
            const volume = await soundpad.getVolume();

            socket.emit('currentUpdated', current, () => {});
            socket.emit('historyUpdated', history, () => {});
            socket.emit('soundListUpdated', soundList, () => {});
            socket.emit('volumeUpdated', volume, () => {});
            noderes({ ok: true, message: `initial state succesfully transmitted`, data: null })
        })

        //play
        socket.on("play", async (serverReq, serverRes) => {
        try {
            const res = await soundpad.play(serverReq.soundIndex);
            serverRes?.(res
            ? { ok: true, message: `sound ${serverReq.soundIndex} played successfully`, data: null }
            : { ok: false, message: `sound ${serverReq.soundIndex} play error`, data: null }
            );
        } catch (err) {
            serverRes?.({ ok: false, message: err.message, data: null });
        }
        });

        //stop
        socket.on("stop", async (serverReq, serverRes) => {
        try {
            const res = await soundpad.stop();
            serverRes?.(res
            ? { ok: true, message: "stopped successfully", data: null }
            : { ok: false, message: "sound stop error", data: null }
            );
        } catch (err) {
            serverRes?.({ ok: false, message: err.message, data: null });
        }
        });
        
        //togglePause
        socket.on("togglePause", async (serverReq, serverRes) => {
        try {
            const res = await soundpad.togglePause();
            serverRes?.(res
            ? { ok: true, message: `sound paused successfully`, data: null }
            : { ok: false, message: `sound paused error`, data: null }
            );
        } catch (err) {
            serverRes?.({ ok: false, message: err.message, data: null });
        }
        });

        //jump
        socket.on("jump", async (serverReq, serverRes) => {
        try {
            const res = await soundpad.jump(serverReq.percentage);
            serverRes?.(res
            ? { ok: true, message: `sound jumped ${serverReq.percentage} successfully`, data: null }
            : { ok: false, message: `sound jumped ${serverReq.percentage} error`, data: null }
            );
        } catch (err) {
            serverRes?.({ ok: false, message: err.message, data: null });
        }
        });

        //setVolume
        socket.on("setVolume", async (serverReq, serverRes) => {
        try {
            const res = await soundpad.setVolume(serverReq.volume);
            serverRes?.(res
            ? { ok: true, message: `volume ${serverReq.volume} setted successfully`, data: null }
            : { ok: false, message: `volume ${serverReq.volume} set error`, data: null }
            );
        } catch (err) {
            serverRes?.({ ok: false, message: err.message, data: null });
        }
        });

        //getSoundListJSON
        socket.on("getSoundListJSON", async (serverReq, serverRes) => {
        try {
            const list = await soundpad.getSoundListJSON();
            serverRes?.(list
            ? { ok: true, message: "soundList received successfully", data: list }
            : { ok: false, message: "soundList receive error", data: null }
            );
        } catch (err) {
            serverRes?.({ ok: false, message: err.message, data: null });
        }
        });

        soundpad.on("currentUpdated", (current) => {
        socket.emit("currentUpdated", current, () => {});
        });

        soundpad.on('historyUpdated', (history) => {
        socket.emit('historyUpdated', history, () => {});
        });

        soundpad.on('soundListUpdated', (soundList) => {
        socket.emit('soundListUpdated', soundList, () => {});
        });

        soundpad.on('volumeUpdated', (volume) => {
        socket.emit('volumeUpdated', volume, () => {});
        });
    });
}