import { Injectable } from '@angular/core'
import { Terminal } from 'xterm'
import { UiService } from './ui.service'
import { evaluateKeyboardEvent } from 'xterm/lib/core/input/Keyboard'
import { fit } from 'xterm/lib/addons/fit/fit'

declare var splitSlice: any
declare var transport: any
declare var window: any
declare var term: any


@Injectable({
  providedIn: 'root'
})
export class XtermService {
  public term: any
 
  private settings = null


  get getTerminal(): Terminal {
    return this.term
  }

  set setTerminal(term) {
    this.term = term
  }

  constructor(private uiService: UiService) {

    window.ws = null
    window.transport = null
    window.settings = null
    window.term = null
  }

  termReset() {
    this.term.write('\n\r')
      this.term.writeln('Connection closed... terminal will reset in few seconds')
    setTimeout(() => {
      this.term.clear()
      this.term.writeln('~ $ Demo of a pure web-based SSH client using AWS IoT Secure Tunneling - @abenfat')
      window.term = null 
    }, 3000)
  }

  termInit(xtermContainer: HTMLElement): void {

 
    this.term = new Terminal({ fontSize: 12, cursorBlink: true, theme: {
      background: '#222226',

    } })




    this.term.open(xtermContainer)
    this.term.writeln('~ $ Demo of a web-based SSH client using AWS IoT Secure Tunneling - @alifrugal')
   
    window.startxtermjs = this.startxtermjs;
    window.term = null
    window.termCore = this.term
    window.termCore.textarea.onkeyup = (e) => {
      this.onkeydown(e)
    }
    window.termCore.textarea.onpaste = (e) => { this.onpaste(e) }
    fit(this.term)
    window.resize = () => { fit(this.term)
    }
    window.onresize = () => {
      clearTimeout(window.resizeInterval)
      window.resizeInterval = setTimeout(window.resize, 400);
    }
  }

  startxtermjs() {
    const self = window;
    window.term = window.termCore
    window.settings = transport.settings
    
    if (!transport.auth.authenticated) {

      window.connectionState = true
      window.term.clear()
      window.term.write(`Successfully connected to ${window.transport.auth.hostname}`)
      window.term.write('\r\n')
      window.term.write(`~ $ Login as: `)
    }

  }

  private onkeydown(e) {
   // console.log(e)
    const self = window;
    const printable = !e.altKey && !e.ctrlKey && !e.metaKey;
    if (transport == null)
      return;

    // Sanity Checks
    if (!window.ws || !window.transport || transport.auth.failedAttempts >= 5 || transport.auth.awaitingAuthentication) {
      return;
    }

    let pressedKey: string;
    /* IE isn't very good so it displays one character keys as full names in .key
        EG - e.key = " " to e.key = "Spacebar"
        so assuming .char is one character we'll use that instead */
    if (e.char && e.char.length === 1) {
      pressedKey = e.char;
    } else {
      pressedKey = e.key;
    }

    // So we don't spam single control characters
    if (pressedKey.length > 1 && (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) && pressedKey !== 'Backspace') {
      return;
    }

    if (!transport.auth.authenticated) {

      // Other clients doesn't allow control characters during authentication
      if (e.altKey || e.ctrlKey || e.metaKey) {
        return;
      }

      // We can't input stuff like 'ArrowUp'
      if (pressedKey.length > 1 && (e.keyCode !== 13 && e.keyCode !== 8)) {
        return;
      }

      /* While termPassword is undefined, add all input to termUsername
          when it becomes defined then change targets to self.transport.auth.termPassword */
      switch (e.keyCode) {
        case 8: // backspace
          if (self.transport.auth.termPassword === undefined) {
            //console.log("case 8")

            if (transport.auth.termUsername.length > 0) {
             // command = evaluateKeyboardEvent(e, false, false, false).key;
             if (self.term._core.buffer.x > 2) {
              self.term.write('\b \b');
            }
              //this.termBackspace(self.term);
              transport.auth.termUsername = self.transport.auth.termUsername.slice(0,
              transport.auth.termUsername.length - 1);
            }
          } else {
              transport.auth.termPassword = self.transport.auth.termPassword.slice(0,
              transport.auth.termPassword.length - 1);
          }
          break;
        case 13: // enter
          if (self.transport.auth.termPassword === undefined) {
            self.term.write('\n\r' + self.transport.auth.termUsername + '@' +
            self.transport.auth.hostname + '\'s password:');
            self.transport.auth.termPassword = '';
          } else {
            self.term.write('\n\r');
            self.transport.auth.ssh_connection();
            return;
          }
          break;
        default:
          if (self.transport.auth.termPassword === undefined) {
            self.transport.auth.termUsername += pressedKey;
            self.term.write(pressedKey);
          } else {
            self.transport.auth.termPassword += pressedKey;
          }
      }
      return;
    }

    // We've already authenticated so now any keypress is a command for the SSH server
    let command: string;

    // Decides if the keypress is an alphanumeric character or needs escaping
    if (pressedKey.length === 1 && (!(e.altKey || e.ctrlKey || e.metaKey) || (e.altKey && e.ctrlKey))) {
      command = pressedKey;
    } else if (pressedKey.length === 1 && (e.shiftKey && e.ctrlKey)) {
      // allows ctrl + shift + v for pasting
      if (e.key !== 'V') {
        e.preventDefault();
        return;
      }
    } else {
       //  console.log(e.key)
         command = evaluateKeyboardEvent(e, false, false, false).key;

    }

    // Decide if we're going to locally' echo this key or not
    if (self.transport.settings.localEcho) {
      self.transport.settings.parseKey(e);
    }
    /* Regardless of local echo we still want a reply to confirm / update terminal
        could be controversial? but putty does this too (each key press shows up twice)
        Instead we're checking the our locally echoed key and replacing it if the
        received key !== locally echoed key */
    return command === null ? null : self.transport.expect_key(command);
  }
  onpaste(ev) {
    let text

    // Yay IE11 stuff!
    if (window.clipboardData && window.clipboardData.getData) {
      text = window.clipboardData.getData('Text')
    } else if (ev.clipboardData && ev.clipboardData.getData) {
      text = ev.clipboardData.getData('text/plain');
    }

    if (text) {
      // Just don't allow more than 1 million characters to be pasted.
      if (text.length < 1000000) {
        if (text.length > 5000) {
          // If its a long string then chunk it down to reduce load on SSHyClient.parceler
          text = splitSlice(text);
          for (var i = 0; i < text.length; i++) {
            transport.expect_key(text[i]);
          }
          return;
        }
        transport.expect_key(text);
      } else {
        alert('Error: Pasting large strings is not permitted.');
      }
    }
  }


 private termBackspace(term) {
    term.write('\b');
    term.eraseRight(term.buffers._terminal.buffer.x - 1, term.buffers._terminal.buffer.y);
  }
}





