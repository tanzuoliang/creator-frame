const {ccclass, property} = cc._decorator;

const {BaseComponent} = require("./MVC");
/**
 * 列表Item类
 */
@ccclass
class BaseListItem extends BaseComponent{
    constructor(){
        super();
        this.__selectd__ = false;
        this.__data__ = null;
        this._index = -1;
    }

    set selected(value){
        this.__selectd__ = value;
        value && this.node.emit(BaseListItem.SELECT,this);
    }

    get selected(){return this.__selectd__;}


    set index(v){this._index = v;}
    get index(){return this._index;}

    /**
     * 
     * @param {*} data 
     * @param {*} index 索引
     */
    setData(data,index){this.__data__ = data;this._index = index;}
    getData(){return this.__data__};

    /**
     * 选中状态
     */
    onselected(){}
    /**
     * 未选中状态
     */
    onunselected(){}
}

BaseListItem.SELECT = "__item:select__";

module.exports = BaseListItem;