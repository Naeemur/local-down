/*
* @Author: Naeem
* @Date:   2016-07-22 21:33:40
* @Last Modified by:   Naeem
* @Last Modified time: 2016-07-26 00:09:49
*/

let fs = require('fs');
let url = require('url');
let http = require('http');
let path = require('path');

let dbug = 'electron' in process.versions

// let serverRoot = __dirname;
// let serverRoot = 'C:\\wamp\\www';
// let serverRoot = path.basename(__dirname) == 'StaticServer' ? 'C:\\wamp\\www' : __dirname;
let serverRoot = process.argv.indexOf('-f') > 0 ? path.join(process.cwd(), process.argv[process.argv.indexOf('-f')+1]) : process.cwd();
let port = process.argv.indexOf('-p') > 0 ? Number(process.argv[process.argv.indexOf('-p')+1]) : 80;
let noLog = process.argv.indexOf('-s') > 0 ? true : false;
let noIdx = process.argv.indexOf('-n') > 0 ? true : false;
let noIdxExt = process.argv.indexOf('-n') > 0 && /^-e=/.test(process.argv[process.argv.indexOf('-n')+1]) ? (process.argv[process.argv.indexOf('-n')+1]).replace('-e=', '') : 'html';

let fileicon = `<svg file="file.svg" class="ic" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
<g>
	<rect x="4" y="11" width="7" height="1"/>
	<rect x="4" y="9" width="7" height="1"/>
	<rect x="4" y="4" width="4" height="1"/>
	<path d="M3,15H13a1,1,0,0,0,1-1V4.5L10.5,1H3A1,1,0,0,0,2,2V14A1,1,0,0,0,3,15ZM3,2h7l3,3v9H3Z"/>
	<rect x="4" y="7" width="7" height="1"/>
</g>
</svg>
`;
let diricon = `<svg file="folder.svg" class="ic" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
<path d="M7,1H0V15H16V3H9Zm8,13H1V7H15Zm0-8H1V2H6.59l2,2H15Z"/>
</svg>
`;
let updiricon = `<svg file="folder-parent.svg" class="ic" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
<g>
	<path d="M16,3H9L7,1H0V15H16ZM15,14H1V2H6.59l1.7,1.71.3.29H15Z"/>
	<polygon points="5 6 5 10.95 6.77 9.18 9.6 12.01 11.01 10.6 8.18 7.77 9.95 6 5 6"/>
</g>
</svg>
`;
let lefticon = `<svg file="arrow-angle-left.svg" class="ic" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="#fff">
<polygon points="10.83 0.93 5.17 6.59 5.17 6.59 3.76 8 5.17 9.41 10.83 15.07 12.24 13.66 6.59 8 12.24 2.34 10.83 0.93"/>
</svg>
`;
let righticon = `<svg file="arrow-angle-right.svg" class="ic" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="#fff">
<polygon points="10.83 6.59 5.17 0.93 3.76 2.34 9.41 8 3.76 13.66 5.17 15.07 10.83 9.41 12.24 8 10.83 6.59 10.83 6.59"/>
</svg>
`;
let crossicon = `<svg file="win-cross.svg" class="ic" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="#fff">
<polygon points="10.79 3.79 8 6.59 5.21 3.79 3.79 5.21 6.59 8 3.79 10.79 5.21 12.21 8 9.41 10.79 12.21 12.21 10.79 9.41 8 12.21 5.21 10.79 3.79"/>
</svg>
`;
let favicon = new Buffer(`AAABAAEAICAAAAEAIACoEAAAFgAAACgAAAAgAAAAQAAAAAEAIAAAAAAAgBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAipx0UIqccSSKnHIcipxy4Iqcc2CKnHO4ipxz6Iqcc+iKnHOgipxzNIqccpyKnHHcipxw1I6cdDwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB+mGQoipx0vIqccfSOoHLMnrh7RLrYh4TO8I+02wCT1OMIk+znDJf05wyX9N8Ik+TW+I/IxuiLpK7Mf3SWrHc0iqByhIqccYyOoHRQfphkEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfphkcIqccViSpHJopsB7TMLcg8zW/I/46xCX/Pcgm/z/LJ/9AzCf/Qc0o/0HNKP9AzCf/Pson/zzHJv85wyX/NL0j/i21IegnrR3AIqcciCKnHUIbpRUVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAbpRUFI6gdGiKnHGEmqx23LLMf+Da/Iv89ySb/Qc0n/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9AzCf/O8Ul/zK6Ifwprx73JKocniKnHU4bpRUUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACOoHRoipx1uJaoc2jC6Iv49yCb/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/QMwn/z3HJv8rsh//JKkcuCKnHVUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfphkgIqccZySqHNs0vCP1PMcm/kDMJ/9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9BzSb/QMwn/zrFJf4vtSHtI6kctCKnHUEfphkPAAAAAAAAAAAAAAAAH6YZCiKnHFklqx27L7gi/jzHJv5BzSf/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/QMwn/zjCJP4ssx/oIqccpSKnHTMbpRUGAAAAAAAAAAAipx0vJKkcmyuyH/k8yCb/QMwn/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/P8sn/zfBJPwmrB33I6gcbB+mGR8AAAAAAAAAACKnHH0psB7TNr8i/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Pskm/zK5Iv8lqx29IqccUgAAAAAipx0WI6gcszC3IPM9ySb/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9AzCf/PMcl/ymwHu4iqBx/I6cdFiKnHEknrR3RNb4j/kHNJ/9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0DMJv9BzSf/L7cg/iWrHaQipxxKIqcchiyzH+E5wyP/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP82vyT/KbAewyKnHIYipxy4Mrsi7T3IJv9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/zvFJf8utCHbIqcctyKnHNg1viP1Psom/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Pskm/y64IOwipxzYIqcc7TfBJPpAzCf/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9AzCf/Mbgi9iKnHO4ipxz4OMMk/UHNJ/9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0HNKP8yuiH8Iqcc+SKnHPg5wyX9Qc0o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qc0o/zK6Ifwipxz5Iqcc6DfCJPlAzCf/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP8/yyf/L7ki9CKnHOkipxzNNb4j8j7KJ/9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/z3IJv8vtiDmIqcczSKnHKYxuSLpO8Ym/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/OcMl/yuzH9MipxymIqccdiuxH904wiP/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LOKP9Czij/Qs4o/0LO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`, 'base64');

let sendFile = (req, res, fspath, stats) => {
	if(dbug) console.log('SEND FILE');
	let code = 200, opts = {}, hder = {
		"Content-type": getMIME(fspath),
		"Content-length": stats.size,
		"ETag": `"${Number(stats.mtime).toString(36)}"`,
		"Last-modified": stats.mtime.toUTCString(),
	};
	if(typeof req.headers.range == 'string' && req.headers.range.search(/bytes=\d+/g) === 0) {
		opts = getRange(req.headers.range);
		opts.end = (opts.end === undefined || opts.end >= stats.size) ? (stats.size-1) : opts.end;
		hder["Accept-ranges"] = "bytes";
		hder["Content-range"] = `bytes ${opts.start}-${opts.end}/${stats.size}`;
		hder["Content-length"] = 1+opts.end-opts.start;
		code = 206;
		// code = opts.start === 0 ? 200 : 206;
	}
	if(!noLog) console.log(code+' FILE: '+fspath+' : '+hder["Content-type"]+' : '+stats.size+' # '+(req.headers.range || '').replace('bytes=', '')+` | ${(hder["Content-range"] || '').replace('bytes ', '')}`);
	// console.log(hder);
	res.writeHead(code, hder);
	let rs = fs.createReadStream(fspath, opts);
	rs.pipe(res);
};

let sendError = (res,pathname,code=404) => {
	if(dbug) console.log('SEND ERROR');
	if(!noLog) console.log(code+' PATH: '+pathname);
	res.writeHead(code, {
		"Content-type": "text/html"
	});
	res.write(`<body style="font-family: sans-serif; text-align: center; margin: 80px;">
		<h1 style="font-size: 90px; margin-bottom: 30px;">${code}</h1>
		<p><b>${pathname}</b><h2>${ (erm[code] ? erm[code] : 'error').toUpperCase() }!</h2></p>
	</body>`);
	res.end();
};

let getRange = (range) => {
	if(dbug) console.log('GET RANGE');
	let spl = range.toLowerCase().replace('bytes=','').split('-');
	return {
		start: parseInt(spl[0]),
		end: spl[1].length === 0 ? undefined : parseInt(spl[1])
	};
};

let readSize = (byteStr = 0, returnAsString = true, precision = 2, inFac = 1024, outFac = 1024) => {
	if(dbug) console.log('READ SIZE');
	let siz = 0, pr = Math.pow(10, precision);
	byteStr = String(byteStr);
	if(byteStr.search(/KB$/g) > 0 ) siz = parseInt(byteStr) * inFac;
	else if(byteStr.search(/MB$/g) > 0 ) siz = parseInt(byteStr) * inFac * inFac;
	else if(byteStr.search(/GB$/g) > 0 ) siz = parseInt(byteStr) * inFac * inFac * inFac;
	else siz = parseInt(byteStr);
	if(returnAsString) {
		if(siz > outFac*outFac*outFac) return (Math.round(siz/outFac/outFac/outFac*pr)/pr)+' GB';
		else if(siz > outFac*outFac) return (Math.round(siz/outFac/outFac*pr)/pr)+' MB';
		else if(siz > outFac) return (Math.round(siz/outFac*pr)/pr)+' KB';
		else return siz+' B';
	} else return siz;
};

let getMIME = (name) => {
	if(dbug) console.log('GET MIME');
	let e = path.extname(name).replace('.','').toLowerCase();
	// console.log(name, path.extname((name+'').toLowerCase()));
	return ext[e] ? ext[e] : 'data/unknown';
};

let server = http.createServer((req, res) => {
	if(dbug) console.log('SERVER');
	// console.log(req.headers);
	let body, isFolder, isFile;
	let requrl = url.parse(req.url);
	let pathname = requrl.pathname;
	let reqquery = requrl.query;
	let fspath = path.join(serverRoot, decodeURI(pathname).split('/').map(p => decodeURIComponent(p)).join('/'));
	// let rs = fs.createReadStream(path.join(serverRoot,'demo.html'));
	// console.log(pathname, reqquery);
	let qres = (typeof reqquery == 'string') ? reqquery.split('&') : [];
	let queries = {};
	for (let q in qres) {
		let qq = qres[q].split('=');
		if(qq.length == 2) queries[qq[0]] = qq[1];
	}
	// to handle stuff
	res.on('data', (data) => {
		console.log('DATA: ' + data);
	});
	res.on('end', () => {
		console.log('END;');
		// process.stdout.write('\n your name: ');
	});
	res.on('error', (error) => {
		console.log('ERROR: ' + error);
	});
	
	fs.stat(fspath, (err, stats) => {
		if (err) {
			// invalid
			if(pathname == '/favicon.ico') {
				let code = 200, opts = {}, hder = {
					"Content-type": getMIME(fspath),
					"Content-length": favicon.length,
				};
				if(!noLog) console.log(code+' ICON: '+pathname);
				res.writeHead(code, hder);
				res.write(favicon);
				res.end();
			} else {
				sendError(res, pathname, 404)
			}
		} else if (stats.isFile()) {
			// get file
			sendFile(req, res, fspath, stats);
		} else if (stats.isDirectory()) {
			// make html
			if(!noIdx) {
				let body = `
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="theme-color" content="#DDD">
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=10.0, user-scalable=yes">
	<title>${ path.basename(fspath) }</title>
	<style>
		body {
			background: #555;
			margin: 0;
			padding: 0;
			font-family: sans-serif;
		}
		body>div:nth-child(1) {
			margin: 20px auto;
			padding: 16px;
			border-radius: 10px;
			width: 60%;
			height: auto;
			background: #eee;
			color: #000;
			font-size: 16px;
		}
		h2 {
			margin: 0 0 10px 0;
		}
		h2 span {
			display: inline-block;
			float: right;
			line-height: 16px;
			font-size: 16px;
		}
		h2 svg {
			width: 16px;
			height: 16px;
			display: inline-block;
			transform: translateY(2px) translateX(3px);
		}
		table {
			width: 100%;
		}
		tr {
			background: #ccc;
		}
		tr:nth-child(odd) {
			background: #ddd;
		}
		th {
			padding: 4px;
		}
		td {
			line-height: 20px;
			padding: 0 4px;
		}
		td+td, th+th {
			border-left: 1px solid #eee;
		}
		tr img {
			width: 16px;
			height: 16px;
			margin: 4px 0 0 0;
		}
		a {
			text-decoration: none;
			border-radius: 2px;
			color: #00f;
		}
		a:focus {
			color: #fff;
			outline: none;
			background: #00f;
			box-shadow: 0 0 0 2px #00f;
		}
		/* light box */
		body>.l-box {
			position: fixed;
			width: 100%;
			height: 100%;
			box-sizing: border-box;
			margin: 0;
			padding: 0;
			top: 0;
			background: rgba(0,0,0, 1);
			display: none;
			border-radius: 0;
		}
		.l-box.open {
			display: block;
		}
		.l-box>div {
			box-sizing: border-box;
			margin: 0;
			padding: 5px;
			width: 50px;
			height: 50px;
			position: absolute;
			right: 0;
		}
		.l-box-t {
			display: none;
		}
		.l-box>.l-box-i {
			width: 100%;
			height: 100%;
			position: absolute;
			display: flex;
			justify-content: center;
			align-items: center;
			padding: 0;
		}
		.l-box-i img {
			flex: 0 1 auto;
			max-width: 100%;
			max-height: 100%;
		}
		.l-box div[id] {
			/* cursor: pointer; */
		}
		.l-box div svg {
			margin: 4px;
			width: 32px;
			height: 32px;
			opacity: 1;
			/* transition: opacity .3s ease .3s; */
		}
		.l-box .l-btn-p, .l-box .l-btn-n {
			height: 100%;
		}
		.l-box .l-btn-p svg, .l-box .l-btn-n svg {
			position: absolute;
			top: calc(50% - 20px);
		}
		.l-box .l-btn-p {
			right: unset;
			left: 0;
		}
		body.open-l-box {
			overflow: hidden;
			background: #000;
		}
		body.open-l-box .l-box {
			display: block;
		}
		body.open-l-box>div:nth-child(1) {
			opacity: 0;
		}
		body.open-l-box>.l-box div svg {
			animation: fade .5s ease 2s forwards;
		}
		/* body.open-l-box>.l-box div:hover svg {
			animation: none;
		} */
		@keyframes fade {
			0% { opacity: 1; }
			100% { opacity: 0; }
		}
		@media screen and (max-width: 1400px) {
			body>div:nth-child(1) {
				width: 80%;
			}
		}
		@media screen and (max-width: 800px) {
			body>div:nth-child(1) {
				width: 98%;
				margin: 0;
				padding: 1%;
				border-radius: 0;
			}
			body {
				background: #000;
			}
		}
		@media screen and (max-width: 500px) {
			/*table th:nth-child(3), table td:nth-child(3), */
			.date {
				display: none;
			}
		}
	</style>
</head>
<body>
	<div>
		<h2>${ path.basename(fspath) }<span>%%ITEMS%%</span></h2>
		<table cellspacing="0" cellpadding="2">
			<tbody>
				<tr>
					<th></th>
					<th><a href="?sort=NAME${ (!queries.reverse && (queries.sort == 'NAME' || queries.sort === undefined)) ? '&reverse=TRUE' : ''}">NAME</a></th>
					<th class="date"><a href="?sort=DATE${ (!queries.reverse && queries.sort == 'DATE') ? '&reverse=TRUE' : ''}">DATE</a></th>
					<th><a href="?sort=SIZE${ (!queries.reverse && queries.sort == 'SIZE') ? '&reverse=TRUE' : ''}">SIZE</a></th>
				</tr>
				<tr>
					<td><img width="19px" height="19px" src="${ 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(updiricon) }" alt="folder-parent"></td>
					<td><a href="../${ queries.sort ? '?sort='+queries.sort : '' }${ queries.sort && queries.reverse ? '&reverse='+queries.reverse : '' }">^..</a></td>
					<td class="date"></td>
					<td></td>
				</tr>
			`;
				let fls = [], drs = [], odr=0;
				fs.readdir(fspath, (err, files) => {
					if(typeof queries.sort == 'string') files.sort((aa,bb) => { // && queries.sort !== 'NAME'
						// let A = fs.statSync(path.join(fspath,aa)),
						// 	B = fs.statSync(path.join(fspath,bb)),
						let a, 
							b,
							reverse = !(queries.reverse) ? 1 : -1;
						if(queries.sort == 'SIZE') {
							a = fs.statSync(path.join(fspath,aa)).size;
							b = fs.statSync(path.join(fspath,bb)).size;
						} else if(queries.sort == 'DATE') {
							a = fs.statSync(path.join(fspath,aa)).ctime;
							b = fs.statSync(path.join(fspath,bb)).ctime;
						} else {
							a = aa.toLowerCase();
							b = bb.toLowerCase();
						}
						return reverse * ((a>b) - (b>a));
					});
					for (let i in files) {
						// console.dir(files[i]);
						let st = fs.statSync(path.join(fspath,files[i]));
						let isfile = st.isFile();
						let type = isfile ? 'file' : 'folder';
						if (isfile) {
							fls.push(`
					<tr>
						<td><img width="19px" height="19px" src="${ 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(fileicon) }" alt="file"></td>
						<td><a href="${ path.join(pathname, encodeURIComponent(files[i])).split('\\').join('/') }">${ files[i] }</a></td>
						<td class="date">${ st.ctime.toLocaleString() }</td>
						<td>${ readSize(st.size) }</td>
					</tr>
							`);
						} else {
							drs.push(`
					<tr>
						<td><img width="19px" height="19px" src="${ 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(diricon) }" alt="folder"></td>
						<td><a href="${ path.join(pathname, encodeURIComponent(files[i])).split('\\').join('/') }/${ queries.sort ? '?sort='+queries.sort : '' }${ queries.sort && queries.reverse ? '&reverse='+queries.reverse : '' }">${ files[i] }</a></td>
						<td class="date">${ st.ctime.toLocaleString() }</td>
						<td>-</td>
					</tr>
							`);
						}
					}
					ndr = parseInt(drs.length);
					// sort
					drs.sort((aa,bb) => {
						let a = aa.match(/">.+?<\/a>/g)[0].toLowerCase(), 
							b = bb.match(/">.+?<\/a>/g)[0].toLowerCase(), 
							reverse = !(queries.reverse) ? 1 : -1;
						return reverse * ((a>b) - (b>a));
					});
					//
					for (let i in fls) {
						drs.push(fls[i]);
					}
					let trs = drs.join('');
					// body = body.replace('%%ITEMS%%', ndr+' Folders, '+fls.length+' Files');
					body = body.replace('%%ITEMS%%', ndr+diricon+' , '+fls.length+fileicon);
					body += trs +`
			</tbody>
		</table>
	</div>
	<div class="l-box">
		<div class="l-box-t"></div>
		<div class="l-box-i"></div>
		<div class="l-btn-p" id="l-btn-p">${lefticon}</div>
		<div class="l-btn-n" id="l-btn-n">${righticon}</div>
		<div class="l-btn-c" id="l-btn-c">${crossicon}</div>
	</div>
	<script>

window.onload = function() {
	var D = document;
	var I = document.getElementById.bind(document);
	var Q = document.querySelector.bind(document);
	var QA = document.querySelectorAll.bind(document);
	var C = document.createElement.bind(document);

	// console.dir(QA('a[href$=".jpg"], a[href$=".jpeg"], a[href$=".gif"], a[href$=".png"]'));
	var list = QA('a[href$=".jpg"], a[href$=".jpeg"], a[href$=".gif"], a[href$=".png"], a[href$=".JPG"], a[href$=".JPEG"], a[href$=".GIF"], a[href$=".PNG"]');
	var len = Object.keys(list).length; 
	var cid = 0;
	var bdy = Q('body');
	var lbx = Q('.l-box');
	var lbt = Q('.l-box-t');
	var lbi = Q('.l-box-i');
	I('l-btn-p').addEventListener('click', function(e) {
		lbox(cid-1);
	});
	I('l-btn-n').addEventListener('click', function(e) {
		lbox(cid+1);
	});
	I('l-btn-c').addEventListener('click', function(e) {
		lbox(-9);
	});
	
	document.addEventListener('keydown', function(e) {
		if(e.keyCode == 8 || e.keyCode == -16) window.history.back();
		else if(document.body.matches('.open-l-box')) {
			if(e.keyCode == 37) lbox(cid-1);
			else if(e.keyCode == 39) lbox(cid+1);
			else if(e.keyCode == 35 || e.keyCode == 27) e.preventDefault() + lbox(-9);
			return;
		}
		else if(e.keyCode == 38) {
			fidx = Math.max(fidx-1, 0);
			sFoc(fidx) + itms[fidx].focus() + e.preventDefault();
		}
		else if(e.keyCode == 40) {
			fidx = Math.min(fidx+1, ilen-1);
			sFoc(fidx) + itms[fidx].focus() + e.preventDefault();
		}
		else if(e.keyCode == 36) {
			fidx = 0;
			sFoc(fidx) + itms[fidx].focus();
		}
		else if(e.keyCode == 35) {
			fidx = ilen-1;
			sFoc(fidx) + itms[fidx].focus();
		}
	})

	function lbox(idx) {
		if(idx < -5) {
			// close
			bdy.classList.remove('open-l-box');
		} else {
			bdy.classList.add('open-l-box');
			cid = Math.min(Math.max(0, idx), len-1);
			console.log(cid);
			lbi.innerHTML = '<img src="'+list[cid].href+'">';
			lbt.innerHTML = '<img src="'+list[Math.max(0, cid-1)].href+'"><img src="'+list[Math.min(len-1, cid+1)].href+'">';
		}
	}
	
	function sFoc(i) {
		hist[href] = i
		window.localStorage.focushistory = JSON.stringify(hist)
	}

	if(len > 0) for(let i in list) {
		console.dir(i);
		// list[i].attribute
		list[i].idxx = Number(i);
		var ii = Number(i);
		list[i].onclick = function(e) {
			e.preventDefault();
			console.dir(ii);
			// e.target.href
			lbox(e.target.idxx);
		}
	}
	
	var itms = document.querySelectorAll('[href^="/"]');
	var ilen = itms.length;
	var hist = JSON.parse(window.localStorage.focushistory || '{}');
	var href = window.location.href;
	var fidx = hist[href] ? (hist[href] < ilen ? hist[href] : 0) : 0;
	itms[fidx].focus();
};

	</script>
</body>
</html>
					`;
					res.writeHead(200, {
						"Content-type": "text/html",
						"Content-length": body.length,
					});
					// res.write('<h1>Hello Client! to '+path.basename(pathname)+'</h1>');
					if(!noLog) console.log(200 + ' DIRC: ' + fspath);
					res.write(body);
					res.end();
					if(dbug) console.log('WRITE END');
				});
			} else { // no indexing
				let idxpath = path.join(fspath, 'index.'+noIdxExt);
				fs.stat(idxpath, (err, idxstats) => {
					if (err) {
						// invalid
						sendError(res, path.join(pathname, 'index.'+noIdxExt).split('\\').join('/'), 404);
						return;
					}
					if (idxstats.isFile()) {
						sendFile(req, res, idxpath, idxstats);
					} else {
						// no index file
						sendError(res, path.join(pathname, 'index.'+noIdxExt).split('\\').join('/'), 404);
					}
				})
			}
		} else {
			// nah
		}
	});
	
	// rs.on('data', (chunk) => {
	// 	body += chunk;
	// });
	// rs.on('end', (chunk) => {
	// 	// res.end(body);
	// });
	// rs.pipe(res);
	
});

server.listen(port);

// print device IP address
var IPad = 0;
var os = require('os');
var ifaces = os.networkInterfaces();

Object.keys(ifaces).forEach(function (ifname) {
	var alias = 0;

	ifaces[ifname].forEach(function (iface) {
		if ('IPv4' !== iface.family || iface.internal !== false) {
		// skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
		return;
		}

		if (alias >= 1) {
		// this single interface has multiple ipv4 addresses
		console.log(ifname + ':' + alias, iface.address);
		} else {
		// this interface has only one ipv4 adress
		console.log(ifname, iface.address);
		}
		++alias;
	});
});

// en0 192.168.1.101
// eth0 10.0.0.101

console.log(`Serving ${serverRoot} @ localhost:${port}`);

let erm = {
	"404": "not found"
}

let ext = {
	"x3d"			: "application/vnd.hzn-3d-crossword",
	"3gp"			: "video/3gpp",
	"3g2"			: "video/3gpp2",
	"mseq"			: "application/vnd.mseq",
	"pwn"			: "application/vnd.3m.post-it-notes",
	"plb"			: "application/vnd.3gpp.pic-bw-large",
	"psb"			: "application/vnd.3gpp.pic-bw-small",
	"pvb"			: "application/vnd.3gpp.pic-bw-var",
	"tcap"			: "application/vnd.3gpp2.tcap",
	"7z"			: "application/x-7z-compressed",
	"abw"			: "application/x-abiword",
	"ace"			: "application/x-ace-compressed",
	"acc"			: "application/vnd.americandynamics.acc",
	"acu"			: "application/vnd.acucobol",
	"atc"			: "application/vnd.acucorp",
	"adp"			: "audio/adpcm",
	"aab"			: "application/x-authorware-bin",
	"aam"			: "application/x-authorware-map",
	"aas"			: "application/x-authorware-seg",
	"air"			: "application/vnd.adobe.air-application-installer-package+zip",
	"swf"			: "application/x-shockwave-flash",
	"fxp"			: "application/vnd.adobe.fxp",
	"pdf"			: "application/pdf",
	"ppd"			: "application/vnd.cups-ppd",
	"dir"			: "application/x-director",
	"xdp"			: "application/vnd.adobe.xdp+xml",
	"xfdf"			: "application/vnd.adobe.xfdf",
	"aac"			: "audio/x-aac",
	"ahead"			: "application/vnd.ahead.space",
	"azf"			: "application/vnd.airzip.filesecure.azf",
	"azs"			: "application/vnd.airzip.filesecure.azs",
	"azw"			: "application/vnd.amazon.ebook",
	"ami"			: "application/vnd.amiga.ami",
	"apk"			: "application/vnd.android.package-archive",
	"cii"			: "application/vnd.anser-web-certificate-issue-initiation",
	"fti"			: "application/vnd.anser-web-funds-transfer-initiation",
	"atx"			: "application/vnd.antix.game-component",
	"mpkg"			: "application/vnd.apple.installer+xml",
	"aw"			: "application/applixware",
	"les"			: "application/vnd.hhe.lesson-player",
	"swi"			: "application/vnd.aristanetworks.swi",
	"s"				: "text/x-asm",
	"atomcat"		: "application/atomcat+xml",
	"atomsvc"		: "application/atomsvc+xml",
	"atom"			: "application/atom+xml",
	"ac"			: "application/pkix-attr-cert",
	"aif"			: "audio/x-aiff",
	"avi"			: "video/x-msvideo",
	"aep"			: "application/vnd.audiograph",
	"dxf"			: "image/vnd.dxf",
	"dwf"			: "model/vnd.dwf",
	"par"			: "text/plain-bas",
	"bcpio"			: "application/x-bcpio",
	"bin"			: "application/octet-stream",
	"bmp"			: "image/bmp",
	"torrent"		: "application/x-bittorrent",
	"cod"			: "application/vnd.rim.cod",
	"mpm"			: "application/vnd.blueice.multipass",
	"bmi"			: "application/vnd.bmi",
	"sh"			: "application/x-sh",
	"btif"			: "image/prs.btif",
	"rep"			: "application/vnd.businessobjects",
	"bz"			: "application/x-bzip",
	"bz2"			: "application/x-bzip2",
	"csh"			: "application/x-csh",
	"c"				: "text/x-c",
	"cdxml"			: "application/vnd.chemdraw+xml",
	"css"			: "text/css",
	"cdx"			: "chemical/x-cdx",
	"cml"			: "chemical/x-cml",
	"csml"			: "chemical/x-csml",
	"cdbcmsg"		: "application/vnd.contact.cmsg",
	"cla"			: "application/vnd.claymore",
	"c4g"			: "application/vnd.clonk.c4group",
	"sub"			: "image/vnd.dvb.subtitle",
	"cdmia"			: "application/cdmi-capability",
	"cdmic"			: "application/cdmi-container",
	"cdmid"			: "application/cdmi-domain",
	"cdmio"			: "application/cdmi-object",
	"cdmiq"			: "application/cdmi-queue",
	"c11amc"		: "application/vnd.cluetrust.cartomobile-config",
	"c11amz"		: "application/vnd.cluetrust.cartomobile-config-pkg",
	"ras"			: "image/x-cmu-raster",
	"dae"			: "model/vnd.collada+xml",
	"csv"			: "text/csv",
	"cpt"			: "application/mac-compactpro",
	"wmlc"			: "application/vnd.wap.wmlc",
	"cgm"			: "image/cgm",
	"ice"			: "x-conference/x-cooltalk",
	"cmx"			: "image/x-cmx",
	"xar"			: "application/vnd.xara",
	"cmc"			: "application/vnd.cosmocaller",
	"cpio"			: "application/x-cpio",
	"clkx"			: "application/vnd.crick.clicker",
	"clkk"			: "application/vnd.crick.clicker.keyboard",
	"clkp"			: "application/vnd.crick.clicker.palette",
	"clkt"			: "application/vnd.crick.clicker.template",
	"clkw"			: "application/vnd.crick.clicker.wordbank",
	"wbs"			: "application/vnd.criticaltools.wbs+xml",
	"cryptonote"	: "application/vnd.rig.cryptonote",
	"cif"			: "chemical/x-cif",
	"cmdf"			: "chemical/x-cmdf",
	"cu"			: "application/cu-seeme",
	"cww"			: "application/prs.cww",
	"curl"			: "text/vnd.curl",
	"dcurl"			: "text/vnd.curl.dcurl",
	"mcurl"			: "text/vnd.curl.mcurl",
	"scurl"			: "text/vnd.curl.scurl",
	"car"			: "application/vnd.curl.car",
	"pcurl"			: "application/vnd.curl.pcurl",
	"cmp"			: "application/vnd.yellowriver-custom-menu",
	"dssc"			: "application/dssc+der",
	"xdssc"			: "application/dssc+xml",
	"deb"			: "application/x-debian-package",
	"uva"			: "audio/vnd.dece.audio",
	"uvi"			: "image/vnd.dece.graphic",
	"uvh"			: "video/vnd.dece.hd",
	"uvm"			: "video/vnd.dece.mobile",
	"uvu"			: "video/vnd.uvvu.mp4",
	"uvp"			: "video/vnd.dece.pd",
	"uvs"			: "video/vnd.dece.sd",
	"uvv"			: "video/vnd.dece.video",
	"dvi"			: "application/x-dvi",
	"seed"			: "application/vnd.fdsn.seed",
	"dtb"			: "application/x-dtbook+xml",
	"res"			: "application/x-dtbresource+xml",
	"ait"			: "application/vnd.dvb.ait",
	"svc"			: "application/vnd.dvb.service",
	"eol"			: "audio/vnd.digital-winds",
	"djvu"			: "image/vnd.djvu",
	"dtd"			: "application/xml-dtd",
	"mlp"			: "application/vnd.dolby.mlp",
	"wad"			: "application/x-doom",
	"dpg"			: "application/vnd.dpgraph",
	"dra"			: "audio/vnd.dra",
	"dfac"			: "application/vnd.dreamfactory",
	"dts"			: "audio/vnd.dts",
	"dtshd"			: "audio/vnd.dts.hd",
	"dwg"			: "image/vnd.dwg",
	"geo"			: "application/vnd.dynageo",
	"es"			: "application/ecmascript",
	"mag"			: "application/vnd.ecowin.chart",
	"mmr"			: "image/vnd.fujixerox.edmics-mmr",
	"rlc"			: "image/vnd.fujixerox.edmics-rlc",
	"exi"			: "application/exi",
	"mgz"			: "application/vnd.proteus.magazine",
	"epub"			: "application/epub+zip",
	"eml"			: "message/rfc822",
	"nml"			: "application/vnd.enliven",
	"xpr"			: "application/vnd.is-xpr",
	"xif"			: "image/vnd.xiff",
	"xfdl"			: "application/vnd.xfdl",
	"emma"			: "application/emma+xml",
	"ez2"			: "application/vnd.ezpix-album",
	"ez3"			: "application/vnd.ezpix-package",
	"fst"			: "image/vnd.fst",
	"fvt"			: "video/vnd.fvt",
	"fbs"			: "image/vnd.fastbidsheet",
	"fe_launch"		: "application/vnd.denovo.fcselayout-link",
	"f4v"			: "video/x-f4v",
	"flv"			: "video/x-flv",
	"fpx"			: "image/vnd.fpx",
	"npx"			: "image/vnd.net-fpx",
	"flx"			: "text/vnd.fmi.flexstor",
	"fli"			: "video/x-fli",
	"ftc"			: "application/vnd.fluxtime.clip",
	"fdf"			: "application/vnd.fdf",
	"f"				: "text/x-fortran",
	"mif"			: "application/vnd.mif",
	"fm"			: "application/vnd.framemaker",
	"fh"			: "image/x-freehand",
	"fsc"			: "application/vnd.fsc.weblaunch",
	"fnc"			: "application/vnd.frogans.fnc",
	"ltf"			: "application/vnd.frogans.ltf",
	"ddd"			: "application/vnd.fujixerox.ddd",
	"xdw"			: "application/vnd.fujixerox.docuworks",
	"xbd"			: "application/vnd.fujixerox.docuworks.binder",
	"oas"			: "application/vnd.fujitsu.oasys",
	"oa2"			: "application/vnd.fujitsu.oasys2",
	"oa3"			: "application/vnd.fujitsu.oasys3",
	"fg5"			: "application/vnd.fujitsu.oasysgp",
	"bh2"			: "application/vnd.fujitsu.oasysprs",
	"spl"			: "application/x-futuresplash",
	"fzs"			: "application/vnd.fuzzysheet",
	"g3"			: "image/g3fax",
	"gmx"			: "application/vnd.gmx",
	"gtw"			: "model/vnd.gtw",
	"txd"			: "application/vnd.genomatix.tuxedo",
	"ggb"			: "application/vnd.geogebra.file",
	"ggt"			: "application/vnd.geogebra.tool",
	"gdl"			: "model/vnd.gdl",
	"gex"			: "application/vnd.geometry-explorer",
	"gxt"			: "application/vnd.geonext",
	"g2w"			: "application/vnd.geoplan",
	"g3w"			: "application/vnd.geospace",
	"gsf"			: "application/x-font-ghostscript",
	"bdf"			: "application/x-font-bdf",
	"gtar"			: "application/x-gtar",
	"texinfo"		: "application/x-texinfo",
	"gnumeric"		: "application/x-gnumeric",
	"kml"			: "application/vnd.google-earth.kml+xml",
	"kmz"			: "application/vnd.google-earth.kmz",
	"gqf"			: "application/vnd.grafeq",
	"gif"			: "image/gif",
	"gv"			: "text/vnd.graphviz",
	"gac"			: "application/vnd.groove-account",
	"ghf"			: "application/vnd.groove-help",
	"gim"			: "application/vnd.groove-identity-message",
	"grv"			: "application/vnd.groove-injector",
	"gtm"			: "application/vnd.groove-tool-message",
	"tpl"			: "application/vnd.groove-tool-template",
	"vcg"			: "application/vnd.groove-vcard",
	"h261"			: "video/h261",
	"h263"			: "video/h263",
	"h264"			: "video/h264",
	"hpid"			: "application/vnd.hp-hpid",
	"hps"			: "application/vnd.hp-hps",
	"hdf"			: "application/x-hdf",
	"rip"			: "audio/vnd.rip",
	"hbci"			: "application/vnd.hbci",
	"jlt"			: "application/vnd.hp-jlyt",
	"pcl"			: "application/vnd.hp-pcl",
	"hpgl"			: "application/vnd.hp-hpgl",
	"hvs"			: "application/vnd.yamaha.hv-script",
	"hvd"			: "application/vnd.yamaha.hv-dic",
	"hvp"			: "application/vnd.yamaha.hv-voice",
	"sfd"			: "application/vnd.hydrostatix.sof-data",
	"stk"			: "application/hyperstudio",
	"hal"			: "application/vnd.hal+xml",
	"html"			: "text/html",
	"irm"			: "application/vnd.ibm.rights-management",
	"sc"			: "application/vnd.ibm.secure-container",
	"ics"			: "text/calendar",
	"icc"			: "application/vnd.iccprofile",
	"ico"			: "image/x-icon",
	"igl"			: "application/vnd.igloader",
	"ief"			: "image/ief",
	"ivp"			: "application/vnd.immervision-ivp",
	"ivu"			: "application/vnd.immervision-ivu",
	"rif"			: "application/reginfo+xml",
	"3dml"			: "text/vnd.in3d.3dml",
	"spot"			: "text/vnd.in3d.spot",
	"igs"			: "model/iges",
	"i2g"			: "application/vnd.intergeo",
	"cdy"			: "application/vnd.cinderella",
	"xpw"			: "application/vnd.intercon.formnet",
	"fcs"			: "application/vnd.isac.fcs",
	"ipfix"			: "application/ipfix",
	"cer"			: "application/pkix-cert",
	"pki"			: "application/pkixcmp",
	"crl"			: "application/pkix-crl",
	"pkipath"		: "application/pkix-pkipath",
	"igm"			: "application/vnd.insors.igm",
	"rcprofile"		: "application/vnd.ipunplugged.rcprofile",
	"irp"			: "application/vnd.irepository.package+xml",
	"jad"			: "text/vnd.sun.j2me.app-descriptor",
	"jar"			: "application/java-archive",
	"class"			: "application/java-vm",
	"jnlp"			: "application/x-java-jnlp-file",
	"ser"			: "application/java-serialized-object",
	"java"			: "text/x-java-source",
	"js"			: "application/javascript",
	"json"			: "application/json",
	"joda"			: "application/vnd.joost.joda-archive",
	"jpm"			: "video/jpm",
	"jpg"			: "image/jpeg",
	"jpeg"			: "image/jpeg",
	"jpgv"			: "video/jpeg",
	"ktz"			: "application/vnd.kahootz",
	"mmd"			: "application/vnd.chipnuts.karaoke-mmd",
	"karbon"		: "application/vnd.kde.karbon",
	"chrt"			: "application/vnd.kde.kchart",
	"kfo"			: "application/vnd.kde.kformula",
	"flw"			: "application/vnd.kde.kivio",
	"kon"			: "application/vnd.kde.kontour",
	"kpr"			: "application/vnd.kde.kpresenter",
	"ksp"			: "application/vnd.kde.kspread",
	"kwd"			: "application/vnd.kde.kword",
	"htke"			: "application/vnd.kenameaapp",
	"kia"			: "application/vnd.kidspiration",
	"kne"			: "application/vnd.kinar",
	"sse"			: "application/vnd.kodak-descriptor",
	"lasxml"		: "application/vnd.las.las+xml",
	"latex"			: "application/x-latex",
	"lbd"			: "application/vnd.llamagraphics.life-balance.desktop",
	"lbe"			: "application/vnd.llamagraphics.life-balance.exchange+xml",
	"jam"			: "application/vnd.jam",
	"123"			: "application/vnd.lotus-1-2-3",
	"apr"			: "application/vnd.lotus-approach",
	"pre"			: "application/vnd.lotus-freelance",
	"nsf"			: "application/vnd.lotus-notes",
	"org"			: "application/vnd.lotus-organizer",
	"scm"			: "application/vnd.lotus-screencam",
	"lwp"			: "application/vnd.lotus-wordpro",
	"lvp"			: "audio/vnd.lucent.voice",
	"m3u"			: "audio/x-mpegurl",
	"m4v"			: "video/x-m4v",
	"hqx"			: "application/mac-binhex40",
	"portpkg"		: "application/vnd.macports.portpkg",
	"mgp"			: "application/vnd.osgeo.mapguide.package",
	"mrc"			: "application/marc",
	"mrcx"			: "application/marcxml+xml",
	"mxf"			: "application/mxf",
	"nbp"			: "application/vnd.wolfram.player",
	"ma"			: "application/mathematica",
	"mathml"		: "application/mathml+xml",
	"mbox"			: "application/mbox",
	"mc1"			: "application/vnd.medcalcdata",
	"mscml"			: "application/mediaservercontrol+xml",
	"cdkey"			: "application/vnd.mediastation.cdkey",
	"mwf"			: "application/vnd.mfer",
	"mfm"			: "application/vnd.mfmp",
	"msh"			: "model/mesh",
	"mads"			: "application/mads+xml",
	"mets"			: "application/mets+xml",
	"mods"			: "application/mods+xml",
	"meta4"			: "application/metalink4+xml",
	"potm"			: "application/vnd.ms-powerpoint.template.macroenabled.12",
	"docm"			: "application/vnd.ms-word.document.macroenabled.12",
	"dotm"			: "application/vnd.ms-word.template.macroenabled.12",
	"mcd"			: "application/vnd.mcd",
	"flo"			: "application/vnd.micrografx.flo",
	"igx"			: "application/vnd.micrografx.igx",
	"es3"			: "application/vnd.eszigno3+xml",
	"mdb"			: "application/x-msaccess",
	"asf"			: "video/x-ms-asf",
	"exe"			: "application/x-msdownload",
	"cil"			: "application/vnd.ms-artgalry",
	"cab"			: "application/vnd.ms-cab-compressed",
	"ims"			: "application/vnd.ms-ims",
	"application"	: "application/x-ms-application",
	"clp"			: "application/x-msclip",
	"mdi"			: "image/vnd.ms-modi",
	"eot"			: "application/vnd.ms-fontobject",
	"xls"			: "application/vnd.ms-excel",
	"xlam"			: "application/vnd.ms-excel.addin.macroenabled.12",
	"xlsb"			: "application/vnd.ms-excel.sheet.binary.macroenabled.12",
	"xltm"			: "application/vnd.ms-excel.template.macroenabled.12",
	"xlsm"			: "application/vnd.ms-excel.sheet.macroenabled.12",
	"chm"			: "application/vnd.ms-htmlhelp",
	"crd"			: "application/x-mscardfile",
	"lrm"			: "application/vnd.ms-lrm",
	"mvb"			: "application/x-msmediaview",
	"mny"			: "application/x-msmoney",
	"pptx"			: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
	"sldx"			: "application/vnd.openxmlformats-officedocument.presentationml.slide",
	"ppsx"			: "application/vnd.openxmlformats-officedocument.presentationml.slideshow",
	"potx"			: "application/vnd.openxmlformats-officedocument.presentationml.template",
	"xlsx"			: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	"xltx"			: "application/vnd.openxmlformats-officedocument.spreadsheetml.template",
	"docx"			: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"dotx"			: "application/vnd.openxmlformats-officedocument.wordprocessingml.template",
	"obd"			: "application/x-msbinder",
	"thmx"			: "application/vnd.ms-officetheme",
	"onetoc"		: "application/onenote",
	"pya"			: "audio/vnd.ms-playready.media.pya",
	"pyv"			: "video/vnd.ms-playready.media.pyv",
	"ppt"			: "application/vnd.ms-powerpoint",
	"ppam"			: "application/vnd.ms-powerpoint.addin.macroenabled.12",
	"sldm"			: "application/vnd.ms-powerpoint.slide.macroenabled.12",
	"pptm"			: "application/vnd.ms-powerpoint.presentation.macroenabled.12",
	"ppsm"			: "application/vnd.ms-powerpoint.slideshow.macroenabled.12",
	"mpp"			: "application/vnd.ms-project",
	"pub"			: "application/x-mspublisher",
	"scd"			: "application/x-msschedule",
	"xap"			: "application/x-silverlight-app",
	"stl"			: "application/vnd.ms-pki.stl",
	"cat"			: "application/vnd.ms-pki.seccat",
	"vsd"			: "application/vnd.visio",
	"wm"			: "video/x-ms-wm",
	"wma"			: "audio/x-ms-wma",
	"wax"			: "audio/x-ms-wax",
	"wmx"			: "video/x-ms-wmx",
	"wmd"			: "application/x-ms-wmd",
	"wpl"			: "application/vnd.ms-wpl",
	"wmz"			: "application/x-ms-wmz",
	"wmv"			: "video/x-ms-wmv",
	"wvx"			: "video/x-ms-wvx",
	"wmf"			: "application/x-msmetafile",
	"trm"			: "application/x-msterminal",
	"doc"			: "application/msword",
	"wri"			: "application/x-mswrite",
	"wps"			: "application/vnd.ms-works",
	"xbap"			: "application/x-ms-xbap",
	"xps"			: "application/vnd.ms-xpsdocument",
	"mid"			: "audio/midi",
	"mpy"			: "application/vnd.ibm.minipay",
	"afp"			: "application/vnd.ibm.modcap",
	"rms"			: "application/vnd.jcp.javame.midlet-rms",
	"tmo"			: "application/vnd.tmobile-livetv",
	"prc"			: "application/x-mobipocket-ebook",
	"mbk"			: "application/vnd.mobius.mbk",
	"dis"			: "application/vnd.mobius.dis",
	"plc"			: "application/vnd.mobius.plc",
	"mqy"			: "application/vnd.mobius.mqy",
	"msl"			: "application/vnd.mobius.msl",
	"txf"			: "application/vnd.mobius.txf",
	"daf"			: "application/vnd.mobius.daf",
	"fly"			: "text/vnd.fly",
	"mpc"			: "application/vnd.mophun.certificate",
	"mpn"			: "application/vnd.mophun.application",
	"mj2"			: "video/mj2",
	"mpga"			: "audio/mpeg",
	"mxu"			: "video/vnd.mpegurl",
	"mpeg"			: "video/mpeg",
	"m21"			: "application/mp21",
	"mp4a"			: "audio/mp4",
	"mp4"			: "video/mp4",
	"m3u8"			: "application/vnd.apple.mpegurl",
	"mus"			: "application/vnd.musician",
	"msty"			: "application/vnd.muvee.style",
	"mxml"			: "application/xv+xml",
	"ngdat"			: "application/vnd.nokia.n-gage.data",
	"n"				: "application/vnd.nokia.n-gage.symbian.install",
	"ncx"			: "application/x-dtbncx+xml",
	"nc"			: "application/x-netcdf",
	"nlu"			: "application/vnd.neurolanguage.nlu",
	"dna"			: "application/vnd.dna",
	"nnd"			: "application/vnd.noblenet-directory",
	"nns"			: "application/vnd.noblenet-sealer",
	"nnw"			: "application/vnd.noblenet-web",
	"rpst"			: "application/vnd.nokia.radio-preset",
	"rpss"			: "application/vnd.nokia.radio-presets",
	"n3"			: "text/n3",
	"edm"			: "application/vnd.novadigm.edm",
	"edx"			: "application/vnd.novadigm.edx",
	"ext"			: "application/vnd.novadigm.ext",
	"gph"			: "application/vnd.flographit",
	"ecelp4800"		: "audio/vnd.nuera.ecelp4800",
	"ecelp7470"		: "audio/vnd.nuera.ecelp7470",
	"ecelp9600"		: "audio/vnd.nuera.ecelp9600",
	"oda"			: "application/oda",
	"ogx"			: "application/ogg",
	"oga"			: "audio/ogg",
	"ogv"			: "video/ogg",
	"dd2"			: "application/vnd.oma.dd2+xml",
	"oth"			: "application/vnd.oasis.opendocument.text-web",
	"opf"			: "application/oebps-package+xml",
	"qbo"			: "application/vnd.intu.qbo",
	"oxt"			: "application/vnd.openofficeorg.extension",
	"osf"			: "application/vnd.yamaha.openscoreformat",
	"weba"			: "audio/webm",
	"webm"			: "video/webm",
	"odc"			: "application/vnd.oasis.opendocument.chart",
	"otc"			: "application/vnd.oasis.opendocument.chart-template",
	"odb"			: "application/vnd.oasis.opendocument.database",
	"odf"			: "application/vnd.oasis.opendocument.formula",
	"odft"			: "application/vnd.oasis.opendocument.formula-template",
	"odg"			: "application/vnd.oasis.opendocument.graphics",
	"otg"			: "application/vnd.oasis.opendocument.graphics-template",
	"odi"			: "application/vnd.oasis.opendocument.image",
	"oti"			: "application/vnd.oasis.opendocument.image-template",
	"odp"			: "application/vnd.oasis.opendocument.presentation",
	"otp"			: "application/vnd.oasis.opendocument.presentation-template",
	"ods"			: "application/vnd.oasis.opendocument.spreadsheet",
	"ots"			: "application/vnd.oasis.opendocument.spreadsheet-template",
	"odt"			: "application/vnd.oasis.opendocument.text",
	"odm"			: "application/vnd.oasis.opendocument.text-master",
	"ott"			: "application/vnd.oasis.opendocument.text-template",
	"ktx"			: "image/ktx",
	"sxc"			: "application/vnd.sun.xml.calc",
	"stc"			: "application/vnd.sun.xml.calc.template",
	"sxd"			: "application/vnd.sun.xml.draw",
	"std"			: "application/vnd.sun.xml.draw.template",
	"sxi"			: "application/vnd.sun.xml.impress",
	"sti"			: "application/vnd.sun.xml.impress.template",
	"sxm"			: "application/vnd.sun.xml.math",
	"sxw"			: "application/vnd.sun.xml.writer",
	"sxg"			: "application/vnd.sun.xml.writer.global",
	"stw"			: "application/vnd.sun.xml.writer.template",
	"otf"			: "application/x-font-otf",
	"osfpvg"		: "application/vnd.yamaha.openscoreformat.osfpvg+xml",
	"dp"			: "application/vnd.osgi.dp",
	"pdb"			: "application/vnd.palm",
	"p"				: "text/x-pascal",
	"paw"			: "application/vnd.pawaafile",
	"pclxl"			: "application/vnd.hp-pclxl",
	"efif"			: "application/vnd.picsel",
	"pcx"			: "image/x-pcx",
	"psd"			: "image/vnd.adobe.photoshop",
	"prf"			: "application/pics-rules",
	"pic"			: "image/x-pict",
	"chat"			: "application/x-chat",
	"p10"			: "application/pkcs10",
	"p12"			: "application/x-pkcs12",
	"p7m"			: "application/pkcs7-mime",
	"p7s"			: "application/pkcs7-signature",
	"p7r"			: "application/x-pkcs7-certreqresp",
	"p7b"			: "application/x-pkcs7-certificates",
	"p8"			: "application/pkcs8",
	"plf"			: "application/vnd.pocketlearn",
	"pnm"			: "image/x-portable-anymap",
	"pbm"			: "image/x-portable-bitmap",
	"pcf"			: "application/x-font-pcf",
	"pfr"			: "application/font-tdpfr",
	"pgn"			: "application/x-chess-pgn",
	"pgm"			: "image/x-portable-graymap",
	"png"			: "image/png",
	"ppm"			: "image/x-portable-pixmap",
	"pskcxml"		: "application/pskc+xml",
	"pml"			: "application/vnd.ctc-posml",
	"ai"			: "application/postscript",
	"pfa"			: "application/x-font-type1",
	"pbd"			: "application/vnd.powerbuilder6",
	"pgp"			: "application/pgp-signature",
	"box"			: "application/vnd.previewsystems.box",
	"ptid"			: "application/vnd.pvi.ptid1",
	"pls"			: "application/pls+xml",
	"str"			: "application/vnd.pg.format",
	"ei6"			: "application/vnd.pg.osasli",
	"dsc"			: "text/prs.lines.tag",
	"psf"			: "application/x-font-linux-psf",
	"qps"			: "application/vnd.publishare-delta-tree",
	"wg"			: "application/vnd.pmi.widget",
	"qxd"			: "application/vnd.quark.quarkxpress",
	"esf"			: "application/vnd.epson.esf",
	"msf"			: "application/vnd.epson.msf",
	"ssf"			: "application/vnd.epson.ssf",
	"qam"			: "application/vnd.epson.quickanime",
	"qfx"			: "application/vnd.intu.qfx",
	"qt"			: "video/quicktime",
	"rar"			: "application/x-rar-compressed",
	"ram"			: "audio/x-pn-realaudio",
	"rmp"			: "audio/x-pn-realaudio-plugin",
	"rsd"			: "application/rsd+xml",
	"rm"			: "application/vnd.rn-realmedia",
	"bed"			: "application/vnd.realvnc.bed",
	"mxl"			: "application/vnd.recordare.musicxml",
	"musicxml"		: "application/vnd.recordare.musicxml+xml",
	"rnc"			: "application/relax-ng-compact-syntax",
	"rdz"			: "application/vnd.data-vision.rdz",
	"rdf"			: "application/rdf+xml",
	"rp9"			: "application/vnd.cloanto.rp9",
	"jisp"			: "application/vnd.jisp",
	"rtf"			: "application/rtf",
	"rtx"			: "text/richtext",
	"link66"		: "application/vnd.route66.link66+xml",
	"rss"			: "application/rss+xml",
	"shf"			: "application/shf+xml",
	"st"			: "application/vnd.sailingtracker.track",
	"svg"			: "image/svg+xml",
	"sus"			: "application/vnd.sus-calendar",
	"sru"			: "application/sru+xml",
	"setpay"		: "application/set-payment-initiation",
	"setreg"		: "application/set-registration-initiation",
	"sema"			: "application/vnd.sema",
	"semd"			: "application/vnd.semd",
	"semf"			: "application/vnd.semf",
	"see"			: "application/vnd.seemail",
	"snf"			: "application/x-font-snf",
	"spq"			: "application/scvp-vp-request",
	"spp"			: "application/scvp-vp-response",
	"scq"			: "application/scvp-cv-request",
	"scs"			: "application/scvp-cv-response",
	"sdp"			: "application/sdp",
	"etx"			: "text/x-setext",
	"movie"			: "video/x-sgi-movie",
	"ifm"			: "application/vnd.shana.informed.formdata",
	"itp"			: "application/vnd.shana.informed.formtemplate",
	"iif"			: "application/vnd.shana.informed.interchange",
	"ipk"			: "application/vnd.shana.informed.package",
	"tfi"			: "application/thraud+xml",
	"shar"			: "application/x-shar",
	"rgb"			: "image/x-rgb",
	"slt"			: "application/vnd.epson.salt",
	"aso"			: "application/vnd.accpac.simply.aso",
	"imp"			: "application/vnd.accpac.simply.imp",
	"twd"			: "application/vnd.simtech-mindmapper",
	"csp"			: "application/vnd.commonspace",
	"saf"			: "application/vnd.yamaha.smaf-audio",
	"mmf"			: "application/vnd.smaf",
	"spf"			: "application/vnd.yamaha.smaf-phrase",
	"teacher"		: "application/vnd.smart.teacher",
	"svd"			: "application/vnd.svd",
	"rq"			: "application/sparql-query",
	"srx"			: "application/sparql-results+xml",
	"gram"			: "application/srgs",
	"grxml"			: "application/srgs+xml",
	"ssml"			: "application/ssml+xml",
	"skp"			: "application/vnd.koan",
	"sgml"			: "text/sgml",
	"sdc"			: "application/vnd.stardivision.calc",
	"sda"			: "application/vnd.stardivision.draw",
	"sdd"			: "application/vnd.stardivision.impress",
	"smf"			: "application/vnd.stardivision.math",
	"sdw"			: "application/vnd.stardivision.writer",
	"sgl"			: "application/vnd.stardivision.writer-global",
	"sm"			: "application/vnd.stepmania.stepchart",
	"sit"			: "application/x-stuffit",
	"sitx"			: "application/x-stuffitx",
	"sdkm"			: "application/vnd.solent.sdkm+xml",
	"xo"			: "application/vnd.olpc-sugar",
	"au"			: "audio/basic",
	"wqd"			: "application/vnd.wqd",
	"sis"			: "application/vnd.symbian.install",
	"smi"			: "application/smil+xml",
	"xsm"			: "application/vnd.syncml+xml",
	"bdm"			: "application/vnd.syncml.dm+wbxml",
	"xdm"			: "application/vnd.syncml.dm+xml",
	"sv4cpio"		: "application/x-sv4cpio",
	"sv4crc"		: "application/x-sv4crc",
	"sbml"			: "application/sbml+xml",
	"tsv"			: "text/tab-separated-values",
	"tiff"			: "image/tiff",
	"tao"			: "application/vnd.tao.intent-module-archive",
	"tar"			: "application/x-tar",
	"tcl"			: "application/x-tcl",
	"tex"			: "application/x-tex",
	"tfm"			: "application/x-tex-tfm",
	"tei"			: "application/tei+xml",
	"txt"			: "text/plain",
	"dxp"			: "application/vnd.spotfire.dxp",
	"sfs"			: "application/vnd.spotfire.sfs",
	"tsd"			: "application/timestamped-data",
	"tpt"			: "application/vnd.trid.tpt",
	"mxs"			: "application/vnd.triscape.mxs",
	"t"				: "text/troff",
	"tra"			: "application/vnd.trueapp",
	"ttf"			: "application/x-font-ttf",
	"ttl"			: "text/turtle",
	"umj"			: "application/vnd.umajin",
	"uoml"			: "application/vnd.uoml+xml",
	"unityweb"		: "application/vnd.unity",
	"ufd"			: "application/vnd.ufdl",
	"uri"			: "text/uri-list",
	"utz"			: "application/vnd.uiq.theme",
	"ustar"			: "application/x-ustar",
	"uu"			: "text/x-uuencode",
	"vcs"			: "text/x-vcalendar",
	"vcf"			: "text/x-vcard",
	"vcd"			: "application/x-cdlink",
	"vsf"			: "application/vnd.vsf",
	"wrl"			: "model/vrml",
	"vcx"			: "application/vnd.vcx",
	"mts"			: "model/vnd.mts",
	"vtu"			: "model/vnd.vtu",
	"vis"			: "application/vnd.visionary",
	"viv"			: "video/vnd.vivo",
	"ccxml"			: "application/ccxml+xml",
	"vxml"			: "application/voicexml+xml",
	"src"			: "application/x-wais-source",
	"wbxml"			: "application/vnd.wap.wbxml",
	"wbmp"			: "image/vnd.wap.wbmp",
	"wav"			: "audio/x-wav",
	"davmount"		: "application/davmount+xml",
	"woff"			: "application/x-font-woff",
	"wspolicy"		: "application/wspolicy+xml",
	"webp"			: "image/webp",
	"wtb"			: "application/vnd.webturbo",
	"wgt"			: "application/widget",
	"hlp"			: "application/winhlp",
	"wml"			: "text/vnd.wap.wml",
	"wmls"			: "text/vnd.wap.wmlscript",
	"wmlsc"			: "application/vnd.wap.wmlscriptc",
	"wpd"			: "application/vnd.wordperfect",
	"stf"			: "application/vnd.wt.stf",
	"wsdl"			: "application/wsdl+xml",
	"xbm"			: "image/x-xbitmap",
	"xpm"			: "image/x-xpixmap",
	"xwd"			: "image/x-xwindowdump",
	"der"			: "application/x-x509-ca-cert",
	"fig"			: "application/x-xfig",
	"xhtml"			: "application/xhtml+xml",
	"xml"			: "application/xml",
	"xdf"			: "application/xcap-diff+xml",
	"xenc"			: "application/xenc+xml",
	"xer"			: "application/patch-ops-error+xml",
	"rl"			: "application/resource-lists+xml",
	"rs"			: "application/rls-services+xml",
	"rld"			: "application/resource-lists-diff+xml",
	"xslt"			: "application/xslt+xml",
	"xop"			: "application/xop+xml",
	"xpi"			: "application/x-xpinstall",
	"xspf"			: "application/xspf+xml",
	"xul"			: "application/vnd.mozilla.xul+xml",
	"xyz"			: "chemical/x-xyz",
	"yaml"			: "text/yaml",
	"yang"			: "application/yang",
	"yin"			: "application/yin+xml",
	"zir"			: "application/vnd.zul",
	"zip"			: "application/zip",
	"zmm"			: "application/vnd.handheld-entertainment+xml",
	"zaz"			: "application/vnd.zzazz.deck+xml",
	"mka"			: "audio/x-matroska",
	"mkv"			: "video/x-matroska",
	"mk3d"			: "video/x-matroska-3d"
};