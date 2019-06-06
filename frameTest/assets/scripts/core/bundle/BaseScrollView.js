
/**
*   author:ysjwdaypm
*  
**/

const {ccclass, property} = cc._decorator;

@ccclass
class BaseScrollView extends require("./Group"){
    @property(cc.ScrollView)
    scrollView = null;

    constructor(){
        super();
        this._cells = [];
        this._maxCol = 0;
        this._maxRow = 0;
        this._moveRow = 0;
        this.itemWidth = 0;

        this.contentY = 0;

        this.initContentY = 0;

        this.__itemTop__ = 0;
        this.__itemBottom__ = 0;

        this.__itemAnchorX__ = 0;
        this.__itemAnchorY__ = 0;
    }

    setData(datas,itemWidth,itemHeight,anchorX,anchorY){
        super.setData(datas);
        this.itemWidth = itemWidth;
        this.itemHeight = itemHeight;
        this.__itemAnchorX__ = anchorX;
        this.__itemAnchorY__ = anchorY;

        this.startup();
    }

    startup(){
        this.init();
        this.initItems();
    }

    init(){

        this._maxCol = Math.floor(this.scrollView.node.width / this.itemWidth);
        let dataTotalRows = Math.ceil(this.__datas__.length / this._maxCol);
        this._maxRow =  Math.min( Math.floor(this.scrollView.node.height / this.itemHeight) + 1 , dataTotalRows );
        this.scrollView.content.height = dataTotalRows * this.itemHeight;
        console.log(`------ dataTotalRows = ${dataTotalRows}  height = ${dataTotalRows * this.itemHeight}`);

        this.initContentY = this.contentY = this.scrollView.content.y;
        this.scrollView.node.on("scrolling", this.onScrolling, this);

        this.__itemTop__ = this.itemHeight * (1 - this.__itemAnchorY__);
        this.__itemBottom__ = -(this._maxRow - this.__itemAnchorY__ )* this.itemHeight;

    }

    initItems(){
        this._cells.length = 0;
        let init_x = this.scrollView.node.width * (0 - this.scrollView.node.anchorX);
        let init_y = 0;
        for(let i = 0; i < this._maxRow;i++){
            for(let j = 0; j < this._maxCol;j++){
                let node = cc.instantiate(this.itemPrefab);
                node.parent = this.scrollView.content;
                node.x = init_x + this.itemWidth * (node.anchorX + j);
                node.y = init_y - this.itemHeight * (node.anchorY + i);
                node.__item_row__ = i;
                node.__item_col__ = j;
                this.__addNodeSelect__(node);
                this._cells.push(node);
                this.setNodeData(node);
            }
        }
    }

    setNodeData(node){
        let index = node.__item_row__ * this._maxCol + node.__item_col__;
        if(index < 0 || index >= this.__datas__.length){
            node.active = false;
            // console.log("------ ignore index = " + index);
            return;
        }
        node.active = true;
        node.getComponent(this.itemScript).setData(this.__datas__[index],index);
    }

    onScrolling(event){
        let cy = this.scrollView.content.y;
        if(cy > this.contentY){
            //up
            this._cells.forEach( node => {
                let _y = node.y + cy - this.initContentY;
                if(_y > this.__itemTop__){
                    node.y -= this.itemHeight * this._maxRow;
                    node.__item_row__ += this._maxRow;
                    this.setNodeData(node);
                }
            });
        }else{
            //down
            this._cells.forEach( node => {
                let _y = node.y + cy - this.initContentY;
                if(_y < this.__itemBottom__){
                    node.y += this.itemHeight * this._maxRow;
                    node.__item_row__ -= this._maxRow;
                    this.setNodeData(node);
                }
            });
        }

        this.contentY = cy;
    }
}

module.exports = BaseScrollView;

// @ccclass
// class NewClass extends require("./Group"){

//     @property(cc.ScrollView)
//     scrollView = null;

//     constructor(){
//         super();
//         this._maxCount = 1;
//         this._idx = 0;
//         this._cells = [];
//     }

//     setData(datas,itemHeight){
//         super.setData(datas);
//         this.itemHeight = itemHeight;
//         this.startup();

//     }
    
//     startup(){
//         this.init();
//         this.initItems();
//         this.reload();
//     }

//     init(){
//         this._maxCount = Math.floor(this.scrollView.node.height / this.itemHeight) + 2;
//         if(this.__datas__.length > this._maxCount){
//             this.scrollView.content.height = this._maxCount * this.itemHeight;
//         }
//         else{
//             this.scrollView.content.height = this.scrollView.node.height;
//         }
//         this.scrollView.node.on("scrolling", this.onScrolling, this);

//         cc.log("max:" + this._maxCount);
//     }

//     initItems(){
//         this._cells.length = 0;
//         for(let i = 0; i < this._maxCount; i++){
//             let node = cc.instantiate(this.itemPrefab);
//             node.parent = this.scrollView.content;
//             node.x = node.width * (node.anchorX - 0.5);
//             node.y = -node.height * (1 - node.anchorY) - node.height * i;
//             this.__addNodeSelect__(node);
//             this._cells.push(node);
//         }
//     }

//     onScrolling(event){
//         let offset = event.getScrollOffset();
//         if(offset.y <= 0 && this._idx > 0){
//             // 上移一格
//             offset.y += this.itemHeight;
//             event.scrollToOffset(offset);

//             // 更新数据
//             this._idx--;
//             // cc.log("idx--:" + this._idx);
//             this.reload();
//         }
//         else if(offset.y >= event.getMaxScrollOffset().y && (this._idx < this.__datas__.length - this._maxCount)){
//             // 下移一格
//             // console.log("------------------- offset.y = " + offset.y + "  this._idx = " + this._idx + 
//             // "  event.getMaxScrollOffset().y = " + event.getMaxScrollOffset().y);
//             offset.y -= this.itemHeight;
//             event.scrollToOffset(offset);

//             // 更新数据
//             this._idx++;
//             // cc.log("idx++:" + this._idx);
//             this.reload();
//         }
//     }

//     reload(){
//         for(let i = 0; i < this._cells.length; i++){
//             this.reloadCell(this._idx + i, this._cells[i]);
//         }
//     }

//     reloadCell(idx, scrollViewCell){
//         if(idx < 0 || idx >= this.__datas__.length){
//             return;
//         }

//         scrollViewCell.getComponent(this.itemScript).setData(this.__datas__[idx]);
//     }

//     //update(dt){}

//     onDestroy(){
//         super.onDestroy();
//         this._cells.forEach(node => cc.isValid(node) && this.__removeNodeSelect__(node));
//         this._cells = null;
//     }
// }

// module.exports = NewClass;