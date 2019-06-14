let uid = -1;
let token = "";

let __ROOT_URL__ = "";
let __METHOD__ = "GET";

let _requestTimeout = 8000;
let _showRequestLoading = true;
//存在本地的KEY
let _httpStoreKey_ = "guestInfo";
class HttpServer{
    /**
     * 
     * @param {*} module 请求模块
     * @param {*} action 请求形为
     * @param {*} opts   请求参数
     * @param {*} callfunc 请求成功回调
     * @param {*} timeoutFunc 超时请求回调
     */
    static get(module,action,opts = {},callfunc = null,timeoutFunc = null){
        opts.m = module;
        opts.a = action;
        if(uid != -1){
            opts.uid = uid;
            opts.token = token;
        }

        // 8秒超时
        let timeoutID = setTimeout(() => {
            request.onreadystatechange = res => {};
            if(timeoutFunc) {
                timeoutFunc();
            }else{
                setTimeout(() => {
                    HttpServer.get(module,action,opts,callfunc);
                },200);
            }
        },_requestTimeout);

        let request = new XMLHttpRequest();
        request.onreadystatechange = res => {
            //console.log(`[DEBUG] request ${module}:${action} readyState is ${request.readyState} and status is ${request.status}`);
            if(request.readyState == 4 && request.status == 200){
                _showRequestLoading && window.mh_notify.hideLoading();

                console.log(`[HTTP] response ${request.responseText}`);
                let result = JSON.parse(request.responseText);
                callfunc && callfunc(result);
                clearTimeout(timeoutID);
            }
        };

        let sendinfo = __METHOD__ == "GET" ? HttpServer.queryString(opts) : JSON.stringify(opts);
        console.log("sendinfo is " + sendinfo);
        request.open(__METHOD__,__ROOT_URL__ + "?" + sendinfo);
        request.send();

        _showRequestLoading && window.mh_notify.showLoading("加载中......");
    }

    static queryString (opts){
        let ret = "";
        for(let key in opts){
            ret += (ret != "" ? "&" : "") +  key + "=" + opts[key];
        }

        return ret;
    }

    static setRoot(url){
        __ROOT_URL__ = url;
    }

    static setUid(_uid){
        uid = _uid;
        console.log(`----- set uid is ${uid} ----`);
    }

    static setToken(_token){
        token = _token;
        console.log(`----- set setToken is ${token} ----`);
    }

    /**
     * 超时时间（默认给的是8秒）
     */
    static set requestTimeout(v){
        _requestTimeout = cc.js.isNumber(v) ? v : _requestTimeout;
    }

    /**
     * 是否示请求loading （默认显示）
     */
    static set showRequestLoading(b){
        _showRequestLoading = !!b;
    }

    static setMethod(method){
        if(method != "GET" && method != "POST"){
            console.error(`HTTP method must be POST or GET ,but that you aplly is  ${method}`);
            return;
        }

        __METHOD__ = method;
    }
    static storeGuestInfo(){
        cc.sys.localStorage.setItem(_httpStoreKey_,JSON.stringify({
            uid,token
        }));
    }

    static resetGuestInfo(){
        cc.sys.localStorage.setItem(_httpStoreKey_,"");
    }

    static getGuestInfo(){
        let info = cc.sys.localStorage.getItem(_httpStoreKey_);
        if(info){
            info = JSON.parse(info);
            uid = info.uid;
            token = info.token;
        }
    }
}

HttpServer.getGuestInfo();
module.exports = HttpServer;