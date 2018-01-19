/**
 * A generic store used to show app items. To be replaced with a PPS loading mechanism.
 * @author dkerr
 *
 * $Id: AppItems.js 4273 2012-09-25 17:51:22Z mlapierre@qnx.com $
 */
Ext.define('AppSection.store.AppItems', {
   extend  : 'Ext.data.Store',
   requires: ['AppSection.model.AppItem'],
   xtype: 'appitems',

   config: {
      sorters: ['label'],
      model   : 'AppSection.model.AppItem',
      data: [
         { label: 'Messages',    img: 'messages-icon.png',  safe: true,   event: 'launch1'},
         { label: 'Contacts',    img: 'contacts-icon.png',  safe: true,   event: 'launch2'},
         { label: 'Calendar',    img: 'cal-icon.png',       safe: true,   event: 'launch3'},
         { label: 'App World',   img: 'appworld-icon.png',  safe: true,    event: 'sys.pictures.testRel_ys_picturesaaacd36_'},
         { label: 'Video Chat',  img: 'vchat-icon.png',     safe: true,    event: 'launch5'},
         { label: 'Weather',     img: 'weather-icon.png',   safe: true,    event: 'launch6'},

         { label: 'Music',       img: 'music-icon.png',     safe: true,   event: 'Radio.testRel_Radio______4b123db_'},
         { label: 'Music Store', img: 'mstore-icon.png',    safe: true,   event: 'launch8'},
         { label: 'Video Store', img: 'vstore-icon.png',    safe: true,   event: 'launch9'},
         { label: 'Browser',     img: 'browser-icon.png',   safe: true,    event: 'launch10'},
         { label: 'Bing',        img: 'bing-icon.png',      safe: true,    event: 'launch11'},
         { label: 'YouTube',     img: 'youtube-icon.png',   safe: true,    event: 'launch12'},

         { label: 'Tetris',      img: 'tetris-icon.png',    safe: false,   event: 'ea.tetris.gYABgN6C04glYkRmxO6BgppOPFM'},
         { label: 'Podcasts',    img: 'podcasts-icon.png',  safe: true,    event: 'launch14'},
         { label: 'Facebook',    img: 'fb-icon.png',        safe: true,    event: 'com.facebookforplaybook.gYABgGIoTQuGRMYqlV83okVZick'},
         { label: 'Clock',       img: 'clock-icon.png',     safe: true,   event: 'sys.clock.testRel_sys_clock__cbbd79ad'},
         { label: 'Calculator',  img: 'calc-icon.png',      safe: true,   event: 'sys.calculator.testRel__calculator249878c3'},
         { label: 'BBC News',    img: 'news-icon.png',      safe: true,   event: 'sys.flowers.testc3lzLmZsb3dlcnMgICAgICA'},
      ],
   },
   
});