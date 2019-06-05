
/**
*   author:ysjwdaypm
*  
**/

const {ccclass,property} = cc._decorator;

// @ccclass
// class MyModel extends mh.BaseModel{
//     constructor(){
//         super();
//     }

//     test(){
//         // console.log("----- test ----");
//         setTimeout(() => this.publish("showTest"),200);
//     }
// }

// signaletion(MyModel);
// const model = MyModel.getInstance();

// class MyMeidator extends mh.BaseMediator{
//     constructor(view){
//         super(null,view);
//         // this.subscribe(["showTest"]);
//         // this.model.test();
//     }

//     onMessage(event,...param){
//         // console.log("----- event is " + event);
//     }
// }

// @ccclass
// class NewClass extends BaseLayout{

//     constructor(){
//         super();
//         new MyMeidator(this);
//     }

//     onLoad(){
//         viewImp.registerView("test",this.itemPrefab);
//     }
    
//     start(){
//         this.setData([1,2],ItemConfig.create('test',"TestNode"),5);
//         this.show();

//         // setTimeout(() => this.clean(),4000);
//     }

//     //update(dt){}

//     //onDestroy(){}
// }

@ccclass
class NewClass extends mh.BaseScene{

    @property(cc.Node)
    testNode = null;

    constructor(){
        super("MainScene");
        // new MyMeidator(this);
    }

    start(){
        super.start();
        
        // setTimeout( () => {
        //     viewImp.showView(cc.instantiate(this.secCls),ViewMode.SHARE);
        // },2000);

        // setTimeout( () => {
        //     viewImp.removeCertainViewsByFlag(3);
        // },3000);

        // console.log(cc.winSize);
        mh.moduleStack.show("panel");
        // setTimeout( () => paneStack.show("panel"),2000);
        // setTimeout( () => paneStack.back(),5000);
    }

    //onDestroy(){}
}

module.exports = NewClass;