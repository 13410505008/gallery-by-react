// 'use strict';

require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
// let ReactDOM =require('react-dom');
import ReactDOM from 'react-dom';

//获取图片相关的数据
let imageDatas = require('../data/imageDatas.json');
//利用自执行函数，将图片名信息转换图片URL的路径信息
imageDatas=(function genImageURL(imageDataArr) {
    for(let i=0,j=imageDataArr.length;i<j;i++){
      var singleImageData=imageDataArr[i];
      singleImageData.imageURL=require('../images/'+ singleImageData.fileName);
      imageDataArr[i]=singleImageData;
    }
    return imageDataArr;
})(imageDatas);

class ImgFigure extends  React.Component{
  constructor(props) {
    super(props);
    // this.handleClick=this.handleClick.bind(this);
  }
  /*
   * imgFigure的点击处理函数
   */
  handleClick(e){
    if(this.props.arrange.isCenter){

      this.props.inverse();
    }else{
      this.props.center();
    }

    e.stopPropagation();
    e.preventDefault();
  }
  render(){

    var styleObj={};

    //如果props属性中指定了这张图片的位置，则使用
    if(this.props.arrange.pos){
      styleObj=this.props.arrange.pos;
    }

    //如果图片的旋转角度有值并且不为0，添加旋转角度
    if(this.props.arrange.rotate){
      (['MozTransform','msTransform','WebkitTransform','transform']).forEach(function (value) {
        styleObj[value]='rotate('+this.props.arrange.rotate+'deg)';
      }.bind(this));

    }

    //添加z-index 避免遮盖
    if(this.props.arrange.isCenter){
      styleObj.zIndex = 11;
    } else {
      styleObj.zIndex = 0;
    }

    var imgFigureClassName = 'img-figure';
    imgFigureClassName+=this.props.arrange.isInverse?' is-inverse':'';
    return (
      <figure className={imgFigureClassName} style={styleObj} onClick={this.handleClick.bind(this)}>
        <img src={this.props.data.imageURL}
             alt={this.props.data.title}
        />
        <figcaption>
          <h2 className="image-title">{this.props.data.title}</h2>
          <div className="img-back" onClick={this.handleClick.bind(this)} >
            <p>
              {this.props.data.desc}
            </p>
          </div>
        </figcaption>
      </figure>
    )
  }
}
/*
 * 获取区间范围的一个随机值
 */
function getRangeRandom(low,high) {
  return Math.ceil(Math.random()*(high-low)+low);
}
/*
*获取0~30之间的一个任意的正负值
 */
function get30DegRandom() {
  return ((Math.random()>0.5?'':'-')+Math.ceil(Math.random()*30));
}
//控制组件
class ControllerUnit extends  React.Component{
  handleClick(e){
    //如点击的是当前正在选中态的按钮，则翻转图片，否则将对应的图片居中
    if(this.props.arrange.isCenter){
      this.props.inverse();
    }else{
      this.props.center()
    }
    e.preventDefault();
    e.stopPropagation();
  }
  render(){
    var controllerUnitClassName='controller-unit';
    //如果是对应的是居中发热图片，显示控制按钮的居中态
    if(this.props.arrange.isCenter){
      controllerUnitClassName+=' is-center';

      //如果同时对应的是翻转图片，显示控制按钮的翻转态
      if(this.props.arrange.isInverse){
        controllerUnitClassName+=' is-inverse';
      }
    }
    return (
      <span className={controllerUnitClassName} onClick={this.handleClick.bind(this)}></span>
    );
  }
}
class AppComponent extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      imgsArrangeArr: [
        /* {
        //   pos:{
        //     left:'0',
        //     top:'0'
        //   },
        //  rotate:0,
        //  isInverse:false  //图片正反面  false：正面
            isCenter:false  //图片是否居中
         }*/
      ]
    };
  }


  //储存图片的可取值的范围
  Constant= {
    centerPos: {left:0,right:0},
    hPosRange:{leftSecX:[0,0],rightSecX:[0,0],y:[0,0]},//水平方向的取值范围
    vPosRange:{x:[0,0],topY:[0,0]}//垂直方向的 取值范围
  }
  /*
   *  利用 rearrange 函数，居中对应的图片
   *  @param index 输入当前被居中操作的图片对应的图片信息数组的index值
   *  @return {Function}这是一个闭包函数，其内return一个真正被执行的函数
   */
  center(index){
    return function(){
      this.rearrange(index);
    }.bind(this);
  }
  /*
   *  翻转图片
   *  @param index 输入当前被执行inverse操作的图片对应的图片信息数组的index值
   *  @return {Function}这是一个闭包函数，其内return一个真正被执行的函数
   */
  inverse(index){
    return function () {
      var imgsArrangeArr=this.state.imgsArrangeArr;
      imgsArrangeArr[index].isInverse=!imgsArrangeArr[index].isInverse;
      this.setState({
        imgsArrangeArr:imgsArrangeArr
      });
    }.bind(this);
  }
  /*
   *重新布局所有图片
   * @param centerIndex 指定居中排布的图片
   */
  rearrange(centerIndex){
    // alert('enter rearrange');
    var imgsArrangeArr=this.state.imgsArrangeArr,
      Constant=this.Constant,
      centerPos=Constant.centerPos,
      hPosRange=Constant.hPosRange,
      vPosRange=Constant.vPosRange,
      hPosRangeLeftSecX=hPosRange.leftSecX,
      hPosRangeRightSecX=hPosRange.rightSecX,
      hPosRangeY=hPosRange.y,
      vPosRangeTopY=vPosRange.topY,
      vPosRangeX=vPosRange.x,

      imgsArrangeTopArr=[],
      //上侧区域取一个或不取
      topImgNum=Math.floor(Math.random()*2),
      topImgSpliceIndex=0,

      imgsArrangeCenterArr=imgsArrangeArr.splice(centerIndex,1);

    //首先居中centerIndex 的图片
    imgsArrangeCenterArr[0]={
      pos:centerPos,
      rotate:0, //居中的centerIndex的图片不需要旋转
      isCenter:true
    };


    //取出要布局上侧的图片的状态信息
    topImgSpliceIndex=Math.ceil(Math.random()*(imgsArrangeArr.length-topImgNum));
    imgsArrangeTopArr=imgsArrangeArr.splice(topImgSpliceIndex,topImgNum);

    //布局位于上侧的图片
    imgsArrangeTopArr.forEach(function (value,index) {
      imgsArrangeTopArr[index]={
        pos:{
          top:getRangeRandom(vPosRangeTopY[0],vPosRangeTopY[1]),
          left:getRangeRandom(vPosRangeX[0],vPosRangeX[1])
        },
        rotate:get30DegRandom(),
        isCenter:false
      };
    })

    //布局左右两侧的图片
    for(var i=0,j=imgsArrangeArr.length,k=j/2;i<j;i++){
      var hPosRangeLORX=null;

      //前半部分布局左边，右半部分布局右边
      if(i<k){
        hPosRangeLORX=hPosRangeLeftSecX;
      }else{
        hPosRangeLORX=hPosRangeRightSecX;
      }

      imgsArrangeArr[i]={
        pos:{
          top:getRangeRandom(hPosRangeY[0],hPosRangeY[1]),
          left:getRangeRandom(hPosRangeLORX[0],hPosRangeLORX[1])
        },
        rotate:get30DegRandom(),
        isCenter:false
      };
    }

    if(imgsArrangeTopArr && imgsArrangeTopArr[0]){
      imgsArrangeArr.splice(topImgSpliceIndex,0,imgsArrangeTopArr[0]);
    }

    imgsArrangeArr.splice(centerIndex,0,imgsArrangeCenterArr[0]);

    this.setState({
      imgsArrangeArr:imgsArrangeArr
    });

  }


  // getInitialState(){
  //   return{
  //     imgsArrangeArr:[
  //       // {
  //       //   pos:{
  //       //     left:'0',
  //       //     top:'0'
  //       //   }
  //       // }
  //     ]
  //   };
  // }

  //组件加载以后，为每一张图片计算其位置的范围
  componentDidMount(){
    // alert("enter ComDidMount");
    //首先拿到舞台的大小
    let stageDOM=ReactDOM.findDOMNode(this.refs.stage),
      stageW=stageDOM.scrollWidth,
      stageH=stageDOM.scrollHeight,
      halfStageW=Math.ceil(stageW/2),
      halfStageH=Math.ceil(stageH/2);
    //拿到一个imageFigure的大小
    let imgFigureDOM=ReactDOM.findDOMNode(this.refs.imgFigure0),
      imgW=imgFigureDOM.scrollWidth,
      imgH=imgFigureDOM.scrollHeight,
      halfImgW=Math.ceil(imgW/2),
      halfImgH=Math.ceil(imgH/2);

    //计算中心图片的位置点
    this.Constant.centerPos={
      left:halfStageW-halfImgW,
      top:halfStageH-halfImgH
    };
    //计算左侧、右侧区域图片排布位置的取值范围
    this.Constant.hPosRange.leftSecX[0]=-halfImgW;
    this.Constant.hPosRange.leftSecX[1]=halfStageW-halfImgW*3;
    this.Constant.hPosRange.rightSecX[0]=halfStageW+halfImgW;
    this.Constant.hPosRange.rightSecX[1]=stageW-halfImgW;
    this.Constant.hPosRange.y[0]=-halfImgH;
    this.Constant.hPosRange.y[1]=stageH-halfImgH;

    //计算上侧区域图片的排布位置的取值范围
    this.Constant.vPosRange.topY[0]=-halfImgH;
    this.Constant.vPosRange.topY[1]=halfStageH-halfImgH*3;
    this.Constant.vPosRange.x[0]=halfStageW-imgW;
    this.Constant.vPosRange.x[1]=halfStageW;


    var num=Math.floor(Math.random()*10)
    this.rearrange(num);
  }
  render() {
    var controllerUnits=[],
        imgFigures=[];
    imageDatas.forEach(function (value,index) {

      if(!this.state.imgsArrangeArr[index]){
        this.state.imgsArrangeArr[index]={
          pos:{
            left:0,
            top:0
          },
          rotate:0,
          isInverse:false,
          isCenter:false
        };
      }

      imgFigures.push(<ImgFigure key={index} data={value} ref={'imgFigure'+index } arrange={this.state.imgsArrangeArr[index]} inverse={this.inverse(index)} center={this.center(index)}/> );
      controllerUnits.push(<ControllerUnit arrange={this.state.imgsArrangeArr[index]} inverse={this.inverse(index)} center={this.center(index)} />)

    }.bind(this))

    return (
      <section className="stage" ref="stage">
        <section className="img-sec">
          {imgFigures}
        </section>
        <nav className="controller-nav">
          {controllerUnits}
        </nav>
      </section>
    );
  }
}

AppComponent.defaultProps = {
};

export default AppComponent;
