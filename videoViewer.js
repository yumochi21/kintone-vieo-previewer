(function () {

  "use strict";

  // ☆添付ファイルのフィールドコードをここに設定してください☆
  var ATTACHMENT_FIELD_CODE = 'attachment'; // 初期値：attachment

  // ☆動画を表示するスペースフィールドのコードをここに設定してください☆
  var VIDEO_SPACE_CODE = 'video'; // 初期値：video

  /**
   * ファイルダウンロードのリクエストを作成する
   * @param {string} filekey ファイルキー
   */
  var filedownload = function (filekey) {
    return new kintone.Promise(function (resolve, reject) {
      var apiurl = '/k/v1/file.json?fileKey=' + filekey;
      var xhr = new XMLHttpRequest();
      xhr.open('GET', apiurl, true);
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      xhr.responseType = "blob";
      var blob = xhr.responseType;
      xhr.onload = function () {
        var blob = xhr.response;
        var url = window.URL || window.webkitURL;
        var video = url.createObjectURL(blob);
        resolve(video);
      };
      xhr.send();
    })
  }

  // 詳細画面表示のイベントハンドラを設定
  kintone.events.on('app.record.detail.show', function (event) {

    // スペースを取得
    var videoSpace = kintone.app.record.getSpaceElement(VIDEO_SPACE_CODE);

    var promiseArray = [];

    // 添付ファイル数分、ダウンロードAPIのリクエスト(Promise)を作成
    for (var i = 0; i < event.record[ATTACHMENT_FIELD_CODE].value.length; i++) {
      var fileKey = event.record.attachment.value[i].fileKey;
      var downloadPromise = filedownload(fileKey);
      promiseArray.push(downloadPromise);
    }

    // リクエストを実行
    kintone.Promise.all(promiseArray).then(function (results) {

      // 添付ファイル毎にVideoタグを作成して、スペースに追加していく
      for (var i = 0; i < results.length; i++) {
        var source = document.createElement('source');
        source.src = results[i];

        var video = document.createElement('video');
        video.controls = true;
        video.appendChild(source);

        videoSpace.appendChild(video);
      }
    })
  })
})();