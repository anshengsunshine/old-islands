// components/search/index.js
import {
  KeywordModel
} from '../../models/keyword.js';

import {
  BookModel
} from '../../models/book.js';

import {
  paginationBev
} from '../behaviors/pagination.js';

const keywordModel = new KeywordModel();
const bookModel = new BookModel();

Component({
  /**
   * 组件的属性列表
   */
  behaviors: [paginationBev],
  properties: {
    more: {
      type: String,
      observer: 'loadMore'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    historyWords: [],
    hotWords: [],
    searching: false,
    q: "",
    loadingCenter: false
  },

  //组件初始化时调用的函数
  attached() {
    this.setData({
      historyWords: keywordModel.getHistory()
    })

    keywordModel.getHot().then(res => {
      this.setData({
        hotWords: res.hot
      })
    })
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 触底加载数据
    loadMore(event) {
      if (!this.data.q) {
        return
      }
      if (this.isLocked()) {
        return
      }

      if (this.hasMore()) {
        this.locked();
        bookModel.search(this.getCurrentStart(), this.data.q)
          .then(res => {
            this.setMoreData(res.books);
            this.unLocked();
          }, () => {
            this.unLocked()
          })
      }
    },


    // 点击取消事件
    onCancel(event) {
      this.triggerEvent('cancel', {}, {});
      this.initialize();
    },

    //点击删除搜索的关键字
    onDelete(event) {
      this._closeResult();
      this.initialize();
    },

    // 获取搜索的关键字value
    onConfirm(event) {
      this._showLoadingCenter();
      this._showResult();
      const q = event.detail.value || event.detail.text;
      this.setData({
        q
      })
      bookModel.search(0, q).then(res => {
        this.setMoreData(res.books);
        this.setTotal(res.total);
        keywordModel.addToHistory(q);
        this._hideLoadingCenter();
      })
    },

    //是否显示加载的按钮图案
    _showLoadingCenter() {
      this.setData({
        loadingCenter: true
      })
    },

    //是否隐藏加载的按钮图案
    _hideLoadingCenter() {
      this.setData({
        loadingCenter: false
      })
    },

    //展示搜索到的数据
    _showResult() {
      this.setData({
        searching: true
      })
    },

    //关闭搜索到的结果
    _closeResult() {
      this.setData({
        searching: false,
        q: ''
      })
    },



  }
})