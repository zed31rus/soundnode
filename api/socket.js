import { io } from "socket.io-client";
import PLHStore from "./playbackHistoryStore.js";
import EventEmitter from "events";

export default class socketApi extends EventEmitter {

    constructor() {
        super();
        this.soundpad = new PLHStore(true, true, 100);
        this.socket;
    }

    init(url, cookieHeader) {
        this.soundpad.init();
        this.socket = io(url, {extraHeaders: {Cookie: cookieHeader}});
        this.emit('updateState', 'CONNECTING')

        this.socket.on("connect", async () => {
            console.log(this.socket.id);
            this.emit('updateState', 'CONNECTED')

            //Auth
            this.socket.emit("auth", (res) => {
            if (!res?.ok) {
                console.error("Auth failed:", res?.message);
                return;
            }
            console.log("Authenticated as", res.user.login);
            this.emit('updateState', 'AUTHED')
            });

            //client connected
            this.socket.on("initStates", async (nodereq, noderes) => {
                const current = await this.soundpad.getCurrent();
                const history = await this.soundpad.getHistory();
                const soundList = await this.soundpad.getSoundListJSON();
                const volume = await this.soundpad.getVolume();

                this.socket.emit('currentUpdated', current, () => {});
                this.socket.emit('historyUpdated', history, () => {});
                this.socket.emit('soundListUpdated', soundList, () => {});
                this.socket.emit('volumeUpdated', volume, () => {});
                noderes({ ok: true, message: `initial state succesfully transmitted`, data: null })
            })

            //play
            this.socket.on("play", async (serverReq, serverRes) => {
            try {
                const res = await this.soundpad.play(serverReq.soundIndex);
                serverRes?.(res
                ? { ok: true, message: `sound ${serverReq.soundIndex} played successfully`, data: null }
                : { ok: false, message: `sound ${serverReq.soundIndex} play error`, data: null }
                );
            } catch (err) {
                serverRes?.({ ok: false, message: err.message, data: null });
            }
            });

            //stop
            this.socket.on("stop", async (serverReq, serverRes) => {
            try {
                const res = await this.soundpad.stop();
                serverRes?.(res
                ? { ok: true, message: "stopped successfully", data: null }
                : { ok: false, message: "sound stop error", data: null }
                );
            } catch (err) {
                serverRes?.({ ok: false, message: err.message, data: null });
            }
            });
            
            //togglePause
            this.socket.on("togglePause", async (serverReq, serverRes) => {
            try {
                const res = await this.soundpad.togglePause();
                serverRes?.(res
                ? { ok: true, message: `sound paused successfully`, data: null }
                : { ok: false, message: `sound paused error`, data: null }
                );
            } catch (err) {
                serverRes?.({ ok: false, message: err.message, data: null });
            }
            });

            //jump
            this.socket.on("jump", async (serverReq, serverRes) => {
            try {
                const res = await this.soundpad.jump(serverReq.percentage);
                serverRes?.(res
                ? { ok: true, message: `sound jumped ${serverReq.percentage} successfully`, data: null }
                : { ok: false, message: `sound jumped ${serverReq.percentage} error`, data: null }
                );
            } catch (err) {
                serverRes?.({ ok: false, message: err.message, data: null });
            }
            });

            //setVolume
            this.socket.on("setVolume", async (serverReq, serverRes) => {
            try {
                const res = await this.soundpad.setVolume(serverReq.volume);
                serverRes?.(res
                ? { ok: true, message: `volume ${serverReq.volume} setted successfully`, data: null }
                : { ok: false, message: `volume ${serverReq.volume} set error`, data: null }
                );
            } catch (err) {
                serverRes?.({ ok: false, message: err.message, data: null });
            }
            });

            //getSoundListJSON
            this.socket.on("getSoundListJSON", async (serverReq, serverRes) => {
            try {
                const list = await this.soundpad.getSoundListJSON();
                serverRes?.(list
                ? { ok: true, message: "soundList received successfully", data: list }
                : { ok: false, message: "soundList receive error", data: null }
                );
            } catch (err) {
                serverRes?.({ ok: false, message: err.message, data: null });
            }
            });

            this.socket.on("addFavourite", async (serverReq, ServerRes) => {
                
            })

            this.soundpad.on("currentUpdated", (current) => {
            this.socket.emit("currentUpdated", current, () => {});
            });

            this.soundpad.on('historyUpdated', (history) => {
            this.socket.emit('historyUpdated', history, () => {});
            });

            this.soundpad.on('soundListUpdated', (soundList) => {
            this.socket.emit('soundListUpdated', soundList, () => {});
            });

            this.soundpad.on('volumeUpdated', (volume) => {
            this.socket.emit('volumeUpdated', volume, () => {});
            });
        });
    }

    closeSocket() {
        this.socket.close()
        this.emit('updateState', null)
    }

}