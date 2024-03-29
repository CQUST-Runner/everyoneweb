import { Injectable } from '@angular/core';

const LOG = `
[2022-07-31 09:29:24.843] [renderer1] [warning] [twxs.cmake]: Cannot register 'cmake.cmakePath'. This property is already registered.
[2022-07-31 09:29:28.895] [renderer1] [error] [Extension Host] [ERROR] [default] [2022-07-31T01:29:28.893Z] GitHub Copilot could not connect to server. Extension activation failed: "Failed to get copilot token"
[2022-08-01 16:55:14.786] [renderer1] [error] Cannot read properties of undefined (reading 'find'): TypeError: Cannot read properties of undefined (reading 'find')
    at t.DefaultCompletionItemProvider.provideCompletionItemsInternal (/Applications/Visual Studio Code.app/Contents/Resources/app/extensions/emmet/dist/node/emmetNodeMain.js:1:187358)
    at t.DefaultCompletionItemProvider.provideCompletionItems (/Applications/Visual Studio Code.app/Contents/Resources/app/extensions/emmet/dist/node/emmetNodeMain.js:1:185715)
    at ne.provideCompletionItems (/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/workbench/api/node/extensionHostProcess.js:87:51362)
    at /Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/workbench/api/node/extensionHostProcess.js:87:76493
    at te._withAdapter (/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/workbench/api/node/extensionHostProcess.js:87:66659)
    at te.$provideCompletionItems (/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/workbench/api/node/extensionHostProcess.js:87:76468)
    at s._doInvokeHandler (/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/workbench/api/node/extensionHostProcess.js:95:13708)
    at s._invokeHandler (/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/workbench/api/node/extensionHostProcess.js:95:13390)
    at s._receiveRequest (/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/workbench/api/node/extensionHostProcess.js:95:12107)
    at s._receiveOneMessage (/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/workbench/api/node/extensionHostProcess.js:95:10853)
    at /Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/workbench/api/node/extensionHostProcess.js:95:8957
    at w.invoke (/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/workbench/api/node/extensionHostProcess.js:61:145)
    at v.deliver (/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/workbench/api/node/extensionHostProcess.js:61:2266)
    at p.fire (/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/workbench/api/node/extensionHostProcess.js:61:1844)
    at a.fire (/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/workbench/api/node/extensionHostProcess.js:69:18976)
    at /Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/workbench/api/node/extensionHostProcess.js:111:34679
    at w.invoke (/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/workbench/api/node/extensionHostProcess.js:61:145)
    at v.deliver (/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/workbench/api/node/extensionHostProcess.js:61:2266)
    at p.fire (/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/workbench/api/node/extensionHostProcess.js:61:1844)
    at a.fire (/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/workbench/api/node/extensionHostProcess.js:69:18976)
    at r._receiveMessage (/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/workbench/api/node/extensionHostProcess.js:69:23563)
    at /Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/workbench/api/node/extensionHostProcess.js:69:21097
    at w.invoke (/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/workbench/api/node/extensionHostProcess.js:61:145)
    at v.deliver (/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/workbench/api/node/extensionHostProcess.js:61:2266)
    at p.fire (/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/workbench/api/node/extensionHostProcess.js:61:1844)
    at p.acceptChunk (/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/workbench/api/node/extensionHostProcess.js:69:15807)
    at /Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/workbench/api/node/extensionHostProcess.js:69:14937
    at Socket.R (/Applications/Visual Studio Code.app/Contents/Resources/app/out/vs/workbench/api/node/extensionHostProcess.js:111:13763)
    at Socket.emit (node:events:390:28)
    at addChunk (node:internal/streams/readable:315:12)
    at readableAddChunk (node:internal/streams/readable:289:9)
    at Socket.Readable.push (node:internal/streams/readable:228:10)
    at Pipe.onStreamRead (node:internal/stream_base_commons:199:23)
`

@Injectable()
export class LogService {

  lines: string[];
  index = 0;
  constructor() {
    this.lines = LOG.split('\n');
  }

  getLog(): string[] {
    let count = Math.floor(Math.random() * 10);
    let results: string[] = [];

    for (let i = 0; i < count; i++) {
      results.push(this.lines[(this.index + i) % this.lines.length]);
    }
    this.index += count;
    return results;
  }
}
