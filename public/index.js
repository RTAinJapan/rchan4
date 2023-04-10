var roleInfo = null;
const discordToken = localStorage.getItem('discordToken');
const discordExpire = localStorage.getItem('discordExpire');

// 「Discordでログイン」ボタン
$('#login').on('click', () => {
  fetch(`/getLoginUrl`, { method: 'get', headers: { accept: 'application/json' } })
    .then((res) => res.json())
    .then((res) => {
      const redirect = encodeURIComponent(`${location.origin}${location.pathname}login/discord/index.html`);
      const url = res.url + `&redirect_uri=${redirect}`;
      window.location.replace(url);
    })
    .catch((err) => {
      alert('おしめぇだ');
      console.log(err);
    })
    .finally(() => {
      //
    });
});

// サーバー参加者の情報取得
$('#get_all_user').on('click', () => {
  toggleDisable(true);
  $('#results').text('');

  const data = {};

  fetch(`/getAllUsers`, { method: 'post', headers: { Authorization: `Bearer ${discordToken}`, 'content-type': 'application/json' }, body: JSON.stringify(data) })
    .then((res) => res.json())
    .then((res) => {
      handleDownload(res.data, 'members.csv', true);
    })
    .finally(() => {
      toggleDisable(false);
    });
});

// ロール情報取得
$('#get_role_info').on('click', () => {
  const id = $('#role_id').val();
  if (!id) {
    alert('ロールのIDを入れてね！');
    return;
  }

  toggleDisable(true);
  $('#results').text('処理中だよ');

  const data = { roleId: id };
  console.log(data);

  fetch(`/getRoleInfo`, { method: 'post', headers: { Authorization: `Bearer ${discordToken}`, 'content-type': 'application/json' }, body: JSON.stringify(data) })
    .then((res) => res.json())
    .then((res) => {
      roleInfo = res.data;
      console.log(res.body);

      $('#results').text(JSON.stringify(res.data, null, '  '));
      if (!roleInfo || !roleInfo.id) {
        $('#role_info_text').text(``);
        roleInfo = null;
      } else {
        $('#role_info_text').text(`${roleInfo.id} ${roleInfo.name}`);
      }
    })
    .finally(() => {
      toggleDisable(false);
    });
});

// ロール情報付与
$('#modify_user_role').on('click', () => {
  if (!roleInfo) {
    alert('ロール情報を取得してね！');
    return;
  }
  const roleId = roleInfo.id;
  const isAddRole = $('#modify_user_role_is_add').prop('checked');
  const userIds = $('#modify_user_role_userIds')
    .val()
    .split(/\n|\r/)
    .map((item) => item.trim())
    .filter((item) => item);
  if (!userIds || userIds.length === 0) {
    alert('ロール変更対象のユーザIDを入れてね！');
    return;
  }
  console.log(`modify_user_role\n role: ${roleId}, ${roleInfo.name}\n isAdd: ${isAddRole}`);

  toggleDisable(true);
  $('#results').text('処理中だよ');

  const data = { roleId: roleId, isAddRole: isAddRole, members: userIds };

  fetch(`/modifyUserRole`, { method: 'post', headers: { Authorization: `Bearer ${discordToken}`, 'content-type': 'application/json' }, body: JSON.stringify(data) })
    .then((res) => res.json())
    .then((res) => {
      $('#results').text(JSON.stringify(res.data, null, '  '));
    })
    .finally(() => {
      toggleDisable(false);
    });
});

/**
 * Disable切り替え
 * @param disabled {boolean}
 */
const toggleDisable = (disabled) => {
  $('input').attr('disabled', disabled);
  $('#modify_user_role_userIds').attr('disabled', disabled);
};

/**
 * テキストファイルのダウンロード処理
 * @param content {string} テキスト
 * @param filename {string} ファイル名
 * @param isAddBom {boolean} trueならBOMを付与する
 */
const handleDownload = (content, filename, isAddBom) => {
  const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
  const blobContent = isAddBom ? [bom, content] : [content];

  const blob = new Blob(blobContent, { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  document.body.appendChild(a);
  a.download = filename;
  a.href = url;
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

//---------------------------------------------------------------
// ログインチェック
if (!discordToken) {
  $('#login').prop('disabled', false);
} else {
  if (new Date().getTime() < Number(discordExpire)) {
    fetch(`/checkUser`, { method: 'post', headers: { Authorization: `Bearer ${discordToken}`, 'content-type': 'application/json' } })
      .then((res) => res.json())
      .then((res) => {
        const userInfo = res.data;
        if (userInfo.status === 'ok') {
          $('#auth').hide();
          $('#content').show();
          $('#userinfo').append(`ようこそ ${userInfo.message}`);
        } else {
          alert('お前は誰だ');
          localStorage.removeItem('discordToken');
          localStorage.removeItem('discordExpire');
          localStorage.removeItem('discordState');
        }
      })
      .finally(() => {
        $('#login').prop('disabled', false);
      });
  } else {
    // 期限切れ
    console.log('期限切れだよ');
    $('#login').prop('disabled', false);
    localStorage.removeItem('discordToken');
    localStorage.removeItem('discordExpire');
    localStorage.removeItem('discordState');
  }
}
