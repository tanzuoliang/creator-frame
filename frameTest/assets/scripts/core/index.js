const RES = require("./bundle/Res");


class ClassConfig{
    constructor(prefabName,scriptName,MediatorCLS = null){
        this.prefabName = prefabName;
        this.scriptName = scriptName;
        this.MediatorCLS = MediatorCLS;
    }
}

ClassConfig.create = (prefabName,scriptName,MediatorCLS) => new ClassConfig(prefabName,scriptName,MediatorCLS);

class ItemConfig extends ClassConfig{
    constructor(prefabName,scriptName,width,height){
        super(prefabName,scriptName)
        this.itemWidth = width;
        this.itemHeight = height;
    }
}

ItemConfig.create = (prefabName,scriptName,width,height) => new ItemConfig(prefabName,scriptName,width,height);


class ViewInfo{
    constructor(config,viewType = ViewType.PANEL,viewMode = ViewMode.ALONE){
        this.config = config;
        this.viewType = viewType;
        this.viewMode = viewMode;
    }
}

ViewInfo.create = (config,viewType = ViewType.PANEL,viewMode = ViewMode.ALONE) => new ViewInfo(config,viewType,viewMode);

/**
 * 界面显示方式
 */
const ViewMode = cc.Enum({
    ALONE : 1, //独占
    SHARE : 2  //共享
});

/**
 * 界面类型
 */
const ViewType = cc.Enum({
    UI : 1,
    PANEL : 2,
    ALERT : 3
});

/**
 * 界面管理器
 */
class ViewImp{
    constructor(){
        this.viewMap = {};
        this.__currentViews__ = [];
    }

    createContainer(p){
        let node = new cc.Node();
        node.width = cc.winSize.width;
        node.height = cc.winSize.height;
        node.addComponent(cc.Widget);
        let widget = node.getComponent(cc.Widget);
        widget.top = 0;
        widget.right = 0;
        widget.bottom = 0;
        widget.left = 0;
        node.parent = p;
        return node;
    }

    get uiCOntainer(){return this.__uiContainer__;}
    get panelContainer(){return this.__panelContainer__;}
    get alertContainer(){return this.__alertContainer__;}

    init(){
        let container = cc.find("Canvas");
        this.__modueContainer__ = this.createContainer(container);
        this.__uiContainer__ = this.createContainer(container);
        this.__panelContainer__ = this.createContainer(container);
        this.__alertContainer__ = this.createContainer(container);

        console.log("------ init scene -----");
    }

    /**
     * 注册界面
     * @param {*} name 名字
     * @param {*} ViewPrefab view预制体
     * @param {*} MediatorCLS 管理器
     */
    registerView(name,prefabName,scriptName,MediatorCLS = null,viewType = ViewType.PANEL,viewMode = ViewMode.ALONE){
        if(!(name in this.viewMap)){
            this.viewMap[name] = ViewInfo.create(ClassConfig.create(prefabName,scriptName,MediatorCLS),viewType,viewMode);
        }
    }


    /**
     * 根据注册名字获取显示实例
     * @param {*} name 
     */
    getView(name){
        if(name in this.viewMap){
            let viewInfo = this.viewMap[name];
            let view = cc.instantiate(cc.js.isString(viewInfo.config.prefabName) ? RES.getItem(viewInfo.config.prefabName,cc.Prefab) : viewInfo.config.prefabName);
            view.viewFlag = view.getComponent(viewInfo.config.scriptName).viewFlag;
            if(viewInfo.config.MediatorCLS){
                new viewInfo.config.MediatorCLS(view.getComponent(viewInfo.config.scriptName));
            }else{
                console.log("----- can not find the mediator with " + name + " " + JSON.stringify(viewInfo.config.MediatorCLS));
            }
            return view;
        }

        return null;
    }

    /**
     * 定位面板
     * @param {*} view 
     * @param {*} viewMode 
     * @param {*} viewType 
     */
    locationView(view,viewMode = ViewMode.ALONE,viewType = ViewType.PANEL){
        if(viewMode == ViewMode.ALONE){
            this.removeCertainViewsByFlag(view.viewFlag);
        }

        this.__currentViews__.push(view);

        switch(viewType){
            case ViewType.UI:
                view.parent = this.__uiContainer__;
            break;

            case ViewType.PANEL:
                view.parent = this.__panelContainer__;
            break;

            case ViewType.ALERT:
                view.parent = this.__alertContainer__;
            break;
        }
    }
    
    /**
     * 显示对象
     * @param {*} name 注册时用到的名字 或者一个显示实例
     * @param {*} viewMode 显示模式
     * @param {*} viewType 显示方式
     */
    showView(name,viewMode = ViewMode.ALONE,viewType = ViewType.PANEL){
        let view = null;
        // console.log("----- showView " + name);
        if(name in this.viewMap){
            let viewInfo = this.viewMap[name];
            view = this.getView(name);
            this.locationView(view,viewInfo.viewMode,viewInfo.viewType);
        }else{
            if(name instanceof cc.Component){
                view = name;
                this.locationView(view,viewMode,viewType); 
            }
        }

        return view;
    }

    /**
     * 删除面板 
     * @param {*} view 面板对象
     */
    removeView(view){
        if(cc.js.array.remove(this.__currentViews__,view)){
            view.destroy();
        }
    }

    /**
     * 删除所有，这个一般是在切换场景时执行
     */
    removeAllViews(){
        this.__currentViews__.forEach(node => {
            if(cc.isValid(node)){
                node.destroy();
            }
        });

        this.__currentViews__.length = 0;
    }

    /**
     * 根据特定的显示深度删除显示对象
     * @param {*} flag 
     */
    removeCertainViewsByFlag(flag){
        let len = this.__currentViews__.length;
    
        for(let i = 0; i < len;i++){
            let node = this.__currentViews__[i];
            let removed = false;
            if(cc.isValid(node)){
                if(flag == node.viewFlag || flag & node.viewFlag){
                    removed = true;
                    node.destroy();
                }
            }else{
                removed = true;
            }

            if(removed){
                let lastNode = this.__currentViews__[len - 1];
                this.__currentViews__[i] = lastNode;
                this.__currentViews__[len - 1] = node;
                i--;
                len--;
                console.log(`------- removeCertainViewsByFlag ${flag} remain ${len} views`);
            }
        }

        this.__currentViews__.length = len;
    }
}

const viewImp = new ViewImp();


class BaseScene extends cc.Component{
    constructor(sceneName){
        super();
        this.__sceneName__ = sceneName;
    }

    start(){
        viewImp.init(this.__sceneName__);
    }
}


class ModuleStack{
    constructor(){
        this.__stack__ = [];
        this.__lastPanelName__ = null;
        this.__lastView__ = null;
    }

    /**
     * 显示对象 
     * @param {*} name 注册用到的名字
     * @param {*} keepPath 是否保存回退路径
     */
    show(name,keepPath = true){
        let view = null;
        if(cc.js.isString(name)){
            view = viewImp.showView(name);
            if(view){
                // console.log("--- lastPanelName = " + this.__lastPanelName__);
                if(keepPath && this.__lastPanelName__){
                    // console.log("----- push to stack -----");
                    this.__stack__.push(this.__lastPanelName__);
                }
                this.__lastPanelName__ = name;
            }
        }

        this.__lastView__ = view;
        return view;
    }

    /**
     * 回到上一个界面
     */
    back(moduleName = null){
        this.__lastPanelName__ = null;
        // console.log("----- back ----" + this.__stack__.length)
        if(this.__lastView__ && cc.isValid(this.__lastView__)){
            viewImp.removeView(this.__lastView__);
        }
        this.__lastView__ = null;

        let view = null;
        var mname = null;
        if(this.__stack__.length > 0){
            let name = this.__stack__.pop();
            mname = name;
        }else{
            mname = moduleName;
        }

        if(mname){
            view = this.show(mname);
        }

        return view;
    }

    /**
     * 清除记录
     */
    clean(){
        this.__stack__.length = 0;
        this.__lastPanelName__ = null;
    }
    
}

const moduleStack = new ModuleStack;


/**
 * 

class TestMediator extends core.BaseMediator{
    constructor(model,node){
        this.super(model,node);
        this.subscribe([]);
    }
}

class ChapterView extends core.BaseComponent{
    constructor(){

    }
}
 * 
 */

function signaletion(cls){
    let count = 0;
    cls.prototype.__signaletoneCount__ = function(){
        if(count > 0){
            cc.error("单例只能实例化一次");
        }
        count++;
    }
    let __instance__ = null;

    Object.defineProperty(cls, "instance", {
        get: function () { return __instance__ || (__instance__ = new cls()); },
        enumerable: true,
        configurable: true
    });

}

let out = {
    ViewType,
    ViewMode,
    ClassConfig,
    ItemConfig,
    viewImp,
    moduleStack,
    BaseScene,
    signaletion,
    http : require("./bundle/HTTP"),
    res : require("./bundle/Res"),
    BaseLayout : require("./bundle/BaseLayout"),
    BaseListItem : require("./bundle/BaseListItem"),
    BaseScrollView : require("./bundle/BaseScrollView"),
    Group : require("./bundle/Group"),
}

window.mh = out;

function add(out,resource){
    for(let key in resource){
        out[key] = resource[key];
    }
}

out.BaseLoading = require("./bundle/Loading");

add(out,require("./bundle/MVC"));
add(out,require("./bundle/PlatformManager"));
add(out,require("./bundle/BaseModule"));
add(out,require("./bundle/BasePanel"));


// window.mh = out;
module.exports = mh;