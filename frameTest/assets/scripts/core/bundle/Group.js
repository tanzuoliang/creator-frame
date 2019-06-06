
/**
*   author:ysjwdaypm
*  
**/

const {ccclass, property} = cc._decorator;
const {BaseComponent} = require("./MVC");
const BaseListItem = require("./BaseListItem"); 
@ccclass
class Group extends BaseComponent{

    @property(cc.Prefab)
    itemPrefab = null;

    @property
    itemScript = "";

    constructor(){
        super();
        this.__selectItem__ = null;
        this.__selectIndex__ = -1;
        this.__datas__ = null;
    }

    onDestroy(){
        super.onDestroy();
        this.__datas__ = null;
        this.__selectItem__ = null;
    }

    /**
     * 当前选择的预制体脚本
     */
    get selectedItem(){return this.__selectItem__;}

    /**
     * 数据
     * @param {*} datas 
     */
    setData(datas){
        this.__datas__ = datas;
    }

    /**
     * 当前选择的ITEM索引
     */
    set selectedIndex(index){
        this.__selectIndex__ = index;
    }

    get selectedIndex(){return this.__selectIndex__;}

    __onItemSelect__(bindScript,index){
        if(this.__selectItem__ == bindScript)return;
        if(bindScript){
            if(this.__selectItem__){
                this.__selectItem__.onunselected();
            }
            this.__selectIndex__ = index;
            this.__selectItem__ = bindScript;
            this.__selectItem__.onselected();
            this.node.emit("select");
        }
    }

    __addNodeSelect__(node){
        node.on(BaseListItem.SELECT,this.__onItemSelect__,this);
    }
    
    __removeNodeSelect__(node){
        node.off(BaseListItem.SELECT,this.__onItemSelect__,this);
    }

}

module.exports = Group;