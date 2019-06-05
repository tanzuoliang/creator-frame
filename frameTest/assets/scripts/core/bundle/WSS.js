/**
 * 0 (CONNECTING)
正在链接中
1 (OPEN)
已经链接并且可以通讯
2 (CLOSING)
连接正在关闭
3 (CLOSED)
连接已关闭或者没有链接成功
 */

 
const wssocket = ( () => {
    const SOCKET_TYPE = cc.Enum({
        CONNECTING : 0,
        OPEN : 1,
        CLOSING : 2,
        CLOSED : 3
    });
    

    // const HEART_DATA = JSON.stringify({
    //     // method : "GET",
    //     path : "/heartbeat"
    // });
    
    class WebsocketHeartbeatJs{
        /**
         * 
         * @param {*} url 
         * @param {*} pingTimeout 
         * @param {*} pongTimeout 
         * @param {*} reconnectTimeout 
         * @param {*} pingMsg 
         */
        constructor(url,pingTimeout = 15000,pongTimeout = 10000,reconnectTimeout = 2000,pingMsg){
            this.url = url;
            this.pingTimeout = pingTimeout;
            this.pongTimeout = pongTimeout;
            this.reconnectTimeout = reconnectTimeout;
            this.pingMsg = pingMsg;
    
    
            this.lockReconnect = false;
            this.forbidReconnect = false;
    
            this.pingTimeoutId = -1;
            this.pongTimeoutId = -1;
    
            this.onclose = () => {};
            this.onerror = () => {};
            this.onopen = () => {};
            this.onmessage = () => {};
            this.onreconnect = () => {};
            this.reconnectSuccess = () => {};
            this.ws = null;

            this.room_id = -1;
    
            /**
             * 当前连接的次数
             */
            this.connnectedTimes = 0;

            this.createWebSocket();
        }

        /**
         * 
         * @param {*} room_id 
         */
        setRoomId(room_id){
            this.room_id = room_id;
            console.log(`set roomid is ${room_id}`);
        }

        createWebSocket(){
            try{
                this.ws = new WebSocket(this.url);
                this.initEventHandle();
            }catch(e){
                this.reconnect("create fail");
                console.log(`request connect to ws fail ${JSON.stringify(e)}`);
            }
        }
    
        initEventHandle(){
            this.ws.onclose = () => {
                this.onclose();
                this.reconnect("on close");
            };
    
            this.ws.onerror = (res) => {
                this.onerror();
                this.reconnect(`onError ${JSON.stringify(res)}`);
            };
    
            this.ws.onopen = () => {
                this.onopen();
                //心跳检测重置
                this.heartCheck("心跳检测重置 onOpen");
                this.connnectedTimes++;
                // console.log("----------- open ----- " + this.connnectedTimes);
                if(this.connnectedTimes > 1){
                    this.reconnectSuccess();
                    hideLoading();
                    showToast("欢迎回来！");
                }
            };
    
            this.ws.onmessage = (event) => {
                
                try{
                    let rec = JSON.parse(event.data);
                    if(rec.event != "heartbeat"){
                        console.log(`[websocket] message : ${event.data}`);
                        this.onmessage(rec);
                    }
                }catch(err){
                    console.log(`[debug] error is ${err}`);
                }
                //如果获取到消息，心跳检测重置
                //拿到任何消息都说明当前连接是正常的
                this.heartCheck(`心跳检测重置 onMeesage`);
            };
        
        }
    
        reconnect (why){
            //重连重置心跳
            this.heartReset();
            if(this.lockReconnect || this.forbidReconnect) {
                if(this.forbidReconnect){
                    this.onclose = null;
                    this.onerror = null;
                    this.onopen = null;
                    this.onmessage = null;
                    this.onreconnect = null;
                    this.reconnectSuccess = null;
                    this.ws = null;
                }
                return;
            }
            this.lockReconnect = true;
            this.onreconnect(why);
            //没连接上会一直重连，设置延迟避免请求过多
            setTimeout(() => {
                this.createWebSocket();
                this.lockReconnect = false;
            }, this.reconnectTimeout);

            showLoading("网络重连......");
        }
    
        sendHeartBeat (msg){
            this.ws && this.ws.readyState == SOCKET_TYPE.OPEN && this.ws.send(msg);
            // console.log('[websocket] send ', msg);
        }

        sendData(path,args = {}){
            if(this.room_id != -1)args.room_id = this.room_id;
            args.token = userInfo.access_token;
            let msg = JSON.stringify({
                path,
                args
            });
            console.log('[websocket] send ', msg);
            this.ws.send(msg);
        }
    
        heartCheck (from){
            this.heartReset();
            this.heartStart(from);
        }
    
        heartReset(){
            clearTimeout(this.pingTimeoutId);
            clearTimeout(this.pongTimeoutId);
        }
    
        heartStart(from){
            if(this.forbidReconnect) return;//不再重连就不再执行心跳
            // console.log(`execute heart from ${from} time : ${Date.now()}`);
    
            this.pingTimeoutId = setTimeout( ()=> {
                this.sendHeartBeat(this.pingMsg);
                this.pongTimeoutId = setTimeout( () => {
                    ////如果onclose会执行reconnect，我们执行ws.close()就行了.如果直接执行reconnect 会触发onclose导致重连两次
                    ////这个是用来通知服务端的 当然服务端不一定能收的到呀
                    // console.log(`---- current socket state is ${this.ws.readyState}`);
                    // try{
                    //     if(this.ws.readyState == SOCKET_TYPE.OPEN){
                    //         this.ws.close();
                    //     }
                    // }catch(err){
                    //     console.log(`call websocket close self with err ${JSON.stringify(err)}`)
                    // }
    
                    if(this.ws.readyState == SOCKET_TYPE.OPEN){
                        this.heartCheck("after ping pong");
                    }
                    // this.ws.onclose = () => {console.log("------------ get onclos notify")};
                    // this.reconnect("on close immde");
                },this.pongTimeout);
            },this.pingTimeout);
        }
    
        close(){
            //如果手动关闭连接，不再重连
            console.log('websocket :', "close self");
            this.forbidReconnect = true;
            this.heartReset();
            if(this.ws.readyState == SOCKET_TYPE.OPEN){
                this.ws.close();
            }
        
            
        }
    }
    
    
    let socket_map = {};
    
    /**
     * 构建socket
     * @param {*} opts  url,pingTimeout,reconnectTimeout,reconnectTimeout,pingMsg
     */
    function init(opts = {}){
        let socket = new WebsocketHeartbeatJs(opts.url || "wss://wx.inchi-game.com/websocket",
            opts.pingTimeout || 3000,
            opts.pongTimeout || 3000,
            opts.reconnectTimeout || 3000,
            JSON.stringify({
                path : "/heartbeat",
                args : {
                    token : userInfo.access_token
                }
            }));
            
        if(socket){
            if(opts.onopen){
                socket.onopen = opts.onopen;
            }
    
            if(opts.onmessage){
                socket.onmessage = opts.onmessage;
            }else{
                socket.onmessage = (res => console.log(`get message from server is ${res}`));
            }
    
            socket.onreconnect = opts.onreconnect || ((why) => console.log(`reconnect because ${why}`));
    
            socket.onopen = opts.onopen || (() => console.log(`---- socket open success -------`));

            if(opts.roomId){
                socket.setRoomId(opts.roomId);
            }
        }

        socket_map[opts.flag] = socket;
        return socket;
    }
    
    // function close(){
    //     if(socket){
    //         socket.close();
    //         socket = null;
    //     }
    // }

    // function send(path,args){
    //     if(socket){
    //         socket.sendData(path,args);
    //     }
    // }

    /**
     * 根据标记获取socket实例
     * @param {*} flag 
     */
    let getSockect = (flag) => {
        return socket_map[flag];
    };

    /**
     * 清除socket
     * @param {*} flag  socket 标记
     */
    let close = (flag) => {
        let socket =  socket_map[flag];
        if(socket){
            socket.close();
            delete socket_map[flag];
        }
    };
    
    
    return {
        init,
        close,
        // send,
        getSockect
    };
})();

window.wssocket  =  wssocket;

// module.exports = {
//     initSocket,
//     closeSocket
// }