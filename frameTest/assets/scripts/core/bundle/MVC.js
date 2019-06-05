const MyModelEvent = new cc.EventTarget();
const HttpServer = require("./HTTP");
const {ccclass, property} = cc._decorator;


class Publish{
    publish(event,...param){
        // console.log("-----publish " + event);
        MyModelEvent.emit(event,...param);
    }
}

class Signaleton extends Publish{
    constructor(){
        super();
        this.__signaletoneCount__ && this.__signaletoneCount__();
    }
}

//----------------------------- modelManager -----------
class ModelManager{
    static getModel(module){
        return modelMap[module];
    }

    static setModel(module,model){
        modelMap[module] = model;
    }
}

let modelMap = {};
//----------------------------- modelManager -----------

class BaseModel extends Signaleton{
    /**
     *
     * @param {*} module 模块名
     */
    constructor(module){
        super();
        this.module = module;
        ModelManager.setModel(module,this);
    }

    /**
     * 
     * @param {*} action 
     * @param {*} opts 
     */
    request(action,opts,event = null){
        HttpServer.get(this.module,action,opts,
            res => this._response_(action,res,event),
            other => this.timeoutHandler(action,other));
    }

    _response_(action,res,event){
        this.responseHandler(action,res,event);
        this.publish(event ? event : (this.module + "-" + action));
    }

    /**
     * 回调响应 子类重写
     * @param {*} action 
     * @param {*} res 
     * @param {*} event 
     */
    responseHandler(action,res,event){

    }

    /**
     * 超时处理
     * @param {*} action 
     * @param {*} other 其它数据
     */
    timeoutHandler(action,other){

    }
}


class BaseMediator extends Publish{
    constructor(model,node){
        super();
        this.model = model;
        this.node = node;
        this.node.mediator = this;
        this.__evenMap__ = {};
    }

    /**
     * 订阅事件
     * @param {*} eventList 事件列表
     */
    subscribe(eventList){
        eventList.forEach(event => {
            // console.log("Mediator on event " + event);
            let callback =  MyModelEvent.on(event,(...param) => this.onMessage(event,...param),this);
            this.__evenMap__[event] = callback;
        })
    }

    onMessage(event,...param){

    }

    /**
     * 取消订阅
     */
    unsubscribe(){
        
        for(let event in this.__evenMap__){
            let callback = this.__evenMap__[event];
            MyModelEvent.off(event,callback,this);
        }

        this.__evenMap__ = null;
    }

    /**
     * 销毁对象
     */
    destroy(){
        this.unsubscribe();
        this.node = null;
        this.model = null;
        console.log(`------ BaseMediator Destroy -----`);
    }
}

@ccclass
class BaseComponent extends cc.Component{
    constructor(){
        super();
        this.mediator = null;
        //显示深度
        this.viewFlag = 1 << 0;

        this.__touchNode__ = null;

        this.___currentTouchLocation___ = null;
        this.__validTouchDistance__ = 10;
    }
    registerTouch(node,dis = 10){
        this.__touchNode__ = node;
        this.__touchNode__.on(cc.Node.EventType.TOUCH_START,this.___touchStart___,this);
        this.__touchNode__.on(cc.Node.EventType.TOUCH_END,this.__touchEnd__,this);

        this.__validTouchDistance__ = dis;
    }

    ___touchStart___(evt){
        this.___currentTouchLocation___ = evt.getLocation();
    }

    __touchEnd__(evt){
        let now = evt.getLocation();
        let deltaPoint = now.sub(this.___currentTouchLocation___);
        let distance = deltaPoint.mag();
        // console.log(`------ distance = ${distance}`);
        if(distance < 10){
            this.selected = true;
        }
    }

    onDestroy(){
        // super.onDestroy();
        this.mediator && this.mediator.destroy();
        this.mediator = null;

        if(this.__touchNode__){
            this.__touchNode__.off(cc.Node.EventType.TOUCH_START,this.___touchStart___,this);
            this.__touchNode__.off(cc.Node.EventType.TOUCH_END,this.__touchEnd__,this);
        }

        this.__touchNode__ = null;
    }
}

BaseComponent.prototype.publish = Publish.prototype.publish;

module.exports = {
    BaseComponent,
    BaseModel,
    BaseMediator,
    ModelManager
}
