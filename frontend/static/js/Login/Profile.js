function createQrCode() {
	var qrcode = new QRCode("qrcode");

	function makeCode() {
		qrcode.makeCode("www.youtube.com");
	}
	makeCode();
}