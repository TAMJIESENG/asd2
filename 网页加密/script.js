document.addEventListener('DOMContentLoaded', function() {
    const inputText = document.getElementById('inputText');
    const outputText = document.getElementById('outputText');
    const encryptionMethod = document.getElementById('encryptionMethod');
    const encryptBtn = document.getElementById('encryptBtn');
    const decryptBtn = document.getElementById('decryptBtn');
    const copyBtn = document.getElementById('copyBtn');
    const aesKeyContainer = document.getElementById('aesKeyContainer');
    const aesKey = document.getElementById('aesKey');

    // 监听加密方式变化
    encryptionMethod.addEventListener('change', function() {
        aesKeyContainer.style.display = this.value === 'aes' ? 'block' : 'none';
    });

    // 加密按钮点击事件
    encryptBtn.addEventListener('click', function() {
        const text = inputText.value;
        if (!text) {
            showAlert('请输入要加密的文本', 'warning');
            return;
        }

        try {
            let result;
            switch (encryptionMethod.value) {
                case 'base64':
                    result = btoa(encodeURIComponent(text));
                    break;
                case 'aes':
                    if (!aesKey.value) {
                        showAlert('请输入 AES 密钥', 'warning');
                        return;
                    }
                    result = CryptoJS.AES.encrypt(text, aesKey.value).toString();
                    break;
                case 'md5':
                    result = CryptoJS.MD5(text).toString();
                    break;
                case 'sha256':
                    result = CryptoJS.SHA256(text).toString();
                    break;
            }
            outputText.value = result;
            showAlert('加密成功！', 'success');
        } catch (error) {
            showAlert('加密失败：' + error.message, 'danger');
        }
    });

    // 解密按钮点击事件
    decryptBtn.addEventListener('click', function() {
        const text = inputText.value;
        if (!text) {
            showAlert('请输入要解密的文本', 'warning');
            return;
        }

        try {
            let result;
            switch (encryptionMethod.value) {
                case 'base64':
                    result = decodeURIComponent(atob(text));
                    break;
                case 'aes':
                    if (!aesKey.value) {
                        showAlert('请输入 AES 密钥', 'warning');
                        return;
                    }
                    const bytes = CryptoJS.AES.decrypt(text, aesKey.value);
                    result = bytes.toString(CryptoJS.enc.Utf8);
                    break;
                case 'md5':
                case 'sha256':
                    showAlert('哈希算法不可解密', 'warning');
                    return;
                default:
                    showAlert('不支持的加密方式', 'warning');
                    return;
            }
            outputText.value = result;
            showAlert('解密成功！', 'success');
        } catch (error) {
            showAlert('解密失败：' + error.message, 'danger');
        }
    });

    // 复制按钮点击事件
    copyBtn.addEventListener('click', function() {
        if (outputText.value) {
            outputText.select();
            document.execCommand('copy');
            showAlert('已复制到剪贴板！', 'success');
        } else {
            showAlert('没有可复制的内容', 'warning');
        }
    });

    // 显示提示信息
    function showAlert(message, type) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
        alertDiv.style.zIndex = '1000';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alertDiv);
        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    }
}); 