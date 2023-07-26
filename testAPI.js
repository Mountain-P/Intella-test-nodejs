 //建立request Data
    let requestJson = JSON.stringify({
        "Header": {
            "Method": "00000",
            "ServiceType": "OLPay",
            "MchId": "fitnfunDemo",
            "TradeKey": crypto.createHash('sha256').update("0000").digest('hex'), //將交易金鑰做sha256加密
            "CreateTime": moment(new Date()).format('yyyyMMddHHmmss')
        },
        "Data": {
            "TimeExpire": moment(new Date()).add(7, 'days').format('yyyyMMddHHmmss'),
            "DeviceInfo": "skb0001",
            "StoreOrderNo": "001",
            "Body": "1",
            "FeeType": "TWD",
            "TotalFee": "35",
            "Detail": "1"
        }
    });
    //建立AES-128-CBC的金鑰
    const key = crypto.randomBytes(16);
    // 使用AES-128-CBC 對我們的 Request 加密
    var encrypt = crypto.createCipheriv('aes-128-cbc', key, "8651731586517315");
    var theCipher = encrypt.update(requestJson, 'utf8', 'base64');
    theCipher += encrypt.final('base64');
    // 使用AES-128-CBC 解密我們的 Request 看看是否正確
    var decrypt = crypto.createDecipheriv('aes-128-cbc', key, "8651731586517315");
    var s = decrypt.update(theCipher, 'base64', 'utf8');
    console.log("解密結果:", s + decrypt.final('utf8'));

    //引入公鑰
    let publicKey = fs.readFileSync('intella/pub.pem', 'utf8');
    //利用node-rsa將公鑰轉成可用的method
    let rsaKey = new NodeRSA(publicKey);
    // 將 AES Key 的 buffer 轉換為 base64 字符串
    const keybase64 = key.toString('base64');
    // 使用RSA 對我們的 AES-128-CBC 金鑰加密 輸出成 base64 字符串
    let encryptedKey = rsaKey.encrypt(keybase64, 'base64');


    let postData = JSON.stringify({
        "Request": theCipher,
        "ApiKey": encryptedKey
    });
    console.log('postData: ', postData);
    axios.post('https://a.intella.co/allpaypass/api/general', postData, {
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((res) => {
        console.log(res);
        // let encryptedResponse = res.data.Response;
        // let decryptedResponse = decipher.update(encryptedResponse, 'hex', 'utf8') + decipher.final('utf8');
        // console.log(decryptedResponse);
    }).catch((error) => {
        console.error(error);
    });
