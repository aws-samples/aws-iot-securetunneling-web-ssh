// xtermjs
// https://xtermjs.org/docs/
// Stanford Javascript Crypto Library
// https://github.com/bitwiseshiftleft/sjcl

// https://github.com/stuicey/wsproxy
// https://developer.mozilla.org/en-US/docs/Web/HTTP/Protocol_upgrade_mechanism#Upgrading_to_a_WebSocket_connection
// https://docs.aws.amazon.com/iot/latest/developerguide/mqtt-ws.html
// https://html.spec.whatwg.org/multipage/web-sockets.html#network

// Protocol Basics: Secure Shell Protocol
// https://www.cisco.com/c/en/us/about/press/internet-protocol-journal/back-issues/table-contents-46/124-ssh.html

window = {}

window.onload0 = function() {
    document.getElementById('login_cred').style.display = "block";
    // Sets the default colorScheme to material
    settings = new SSHyClient.settings();
    settings.setColorScheme(1);

    // Apply fit addon
    fit.apply(Terminal)

    // Build the default wsProxy URL for display on sidenav
    buildWSProxyURL()

    // Connect upon hitting Enter from the password field
    document.getElementById("password").addEventListener("keyup", function(event) {
        if(event.key !== "Enter") return;
        document.getElementById("connect").click();
        event.preventDefault();
    });
};

// Run every time the webpage is resized
window.onresize = function() {
    clearTimeout(resizeInterval);
    resizeInterval = setTimeout(resize, 400);
}

// Recalculates the terminal Columns / Rows and sends new size to SSH server + xtermjs
function resize() {
    if (term) {
        term.fit()
    }
}

// Build the entire websocket url eg (wss://localhost:5999/) based on http protocol
function buildWSProxyURL(portPassed) {
    // Decide if we're using secure ws or not
    if(window.location.protocol == "https:"){
        wsproxyProto = "wss"
    }

    var port
    if (portPassed){
        port = ""
    } else {
        port =  ':' + wsproxyPorts[wsproxyProto]
    }

    // Build the wsproxyURL up
    wsproxyURL = wsproxyProto + '://' + wsproxyURL + port + '/'

    document.getElementById("websockURL").value = wsproxyURL
}

// Changes the websocket proxy URL ** BEFORE ** connection ONLY
function modProxyURL(newURL){
    if (!ws) {
        // Strip it down to barebones URL:PORT(optional)
        matches = /^w?s{0,2}:?\/{0,2}(([a-z0-9]+\.)*[a-z0-9]+\.?[a-z]+)\:?([0-9]{1,5})?/g.exec(newURL)
        var port = ""
        if (newURL.match(":")) {
            port = ":"+matches[matches.length-1]
        }
        
        wsproxyURL = matches[1] + port;
        buildWSProxyURL(port)
    }
}

// Toggles the settings navigator
function toggleNav(size) {
    document.getElementById("settingsNav").style.width = size + 'px';
    settings.sidenavElementState = size;
    // We need to update the network traffic whenever the nav is re-opened
    if(size && transport){
        settings.setNetTraffic(transport.parceler.recieveData, true);
        settings.setNetTraffic(transport.parceler.transmitData, false);
    }
    var element = document.getElementById("gear").style;
    element.visibility = element.visibility === "hidden" ? "visible" : "hidden";
}

// Rudimentary checks that an IP address is external and is a valid hostname or IP address
function validate(id, text) {
    if (!text) {
        document.getElementById(id).style.borderBottom = 'solid 2px #ff4d4d'
    } else {
        if (id == "ipaddress") {
            // incase we have a error for the port
            if (text.includes(':')) {
                if (!validate_port(text.split(':')[1])) {
                    document.getElementById(id).style.borderBottom = 'solid 2px #ff4d4d'
                    return
                } else {
                    document.getElementById(id).style.borderBottom = 'solid 2px #c9c9c9'
                    document.getElementById('failure').style.display = "none"
                }
            } else {
                // if we're not doing ports then hide the failure message
                document.getElementById('failure').style.display = "none"
            }
            // test for valid domain name
            if (!/^([a-z0-9]+\.)*[a-z0-9]+\.[a-z]+(\:[0-9]{1,5})?$/.test(text)) {
                if (check_internal(text)) {
                    display_error("Be aware - IP addresses are resolved at the websocket proxy")
                }
                // test ip aswell.
                if (!/^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.|$|(\:[0-9]{1,5}))){4}$/.test(text)) {
                    document.getElementById(id).style.borderBottom = 'solid 2px #ff4d4d'
                    return
                } else {
                    if (check_internal(text)) {
                        display_error("Could no resolve hostname: Please use an external address")
                    }
                    document.getElementById(id).style.borderBottom = 'solid 2px #c9c9c9'
                    return
                }
                document.getElementById(id).style.borderBottom = 'solid 2px #ff4d4d'
                return
            }
        }
        document.getElementById(id).style.borderBottom = 'solid 2px #c9c9c9'
    }
}

// Validates the port is 0 > port < 65536
function validate_port(port_num) {
    if (port_num > 0 && port_num < 65536) {
        return port_num
    } else {
        display_error("Invalid port: port must be between 1 - 65535")
        validate('ipaddress', '')
    }
}

// checks for 10.*.*.*, 192.168.*.*, 172.16.*.*, 127.0.0.1 & loocalhost
function check_internal(ip_address) {
    if (/10\.\d+\.\d+\.\d+/.test(ip_address) || /192\.168\.\d+\.\d+/.test(ip_address) || /172\.16\.\d+\.\d+/.test(ip_address)) {
        return true
    } else if (ip_address == '127.0.0.1' || ip_address == 'localhost') {
        return true
    }

    return false
}

// Displays a given err on the page
function display_error(err) {
    // remove the loading cog and set the 'connecting' to connect
    document.getElementById('load-container').style.display = "none"
    document.getElementById('connect').value = "connect"

    document.getElementById('failure').innerText = err
    document.getElementById('failure').style.display = "block"
}

// Starts the SSH client in scripts/transport.js
function startSSHy() {
    var html_ipaddress = document.getElementById('ipaddress').value
    var termUsername = document.getElementById('username').value
    var termPassword = document.getElementById('password').value

    // find the port number
    if (html_ipaddress.includes(':')) {
        var split = html_ipaddress.split(':')
        html_ipaddress = split[0]
        html_port = validate_port(split[1])
    } else {
        html_port = 22
    }

    if (termUsername.length == 0 || termPassword.length == 0) {
        validate('username', termUsername)
        validate('password', termPassword)
        return
    }

    // Error checking is done so remove any currently displayed errors
    document.getElementById('failure').style.display = "none"
    document.getElementById('connect').value = 'Connecting...'
    document.getElementById('load-container').style.display = "block"

    // Disable websocket proxy modifications
    document.getElementById('websockURL').disabled = true

    // Initialise the window title
    document.title = "SSHy Client";
    // Opens the websocket!
    wsproxyURL += html_ipaddress + ':' + html_port
    ws = new WebSocket(wsproxyURL , 'base64');

    // Sets up websocket listeners
    ws.onopen = function(e) {
        transport = new SSHyClient.Transport(ws, settings);
        transport.auth.termUsername = termUsername;
        transport.auth.termPassword = termPassword;
        transport.auth.hostname = html_ipaddress;
    };

    // Send all recieved messages to SSHyClient.Transport.handle()
    ws.onmessage = function(e) {
        // Convert the recieved data from base64 to a string
        transport.parceler.handle(atob(e.data));
    };

    // Whenever the websocket is closed make sure to display an error if appropriate
    ws.onclose = function(e) {
        // Set the sidenav websocket proxy color to yellow
        document.getElementById('websockURL').classList.remove('brightgreen')	
        document.getElementById('websockURL').classList.add('brightyellow')	
        if (term) {
            // Don't display an error if SSH transport has already detected a graceful exit
            if (transport.closing) {
                return;
            }
            term.write('\n\n\rWebsocket connection to ' + transport.auth.hostname + ' was unexpectedly closed.');
            // If there is no keepAliveInterval then inform users they can use it
            if (!settings.keepAliveInterval) {
                term.write('\n\n\rThis was likely caused by he remote SSH server timing out the session due to inactivity.\r\n- Session Keep Alive interval can be set in the settings to prevent this behaviour.');
            }
        } else {
            // Since no terminal exists we need to initialse one before being able to write the error
            termInit();
            term.write('WebSocket connection failed: Error in connection establishment: code ' + e.code);
        }
    };

    // Just a little abstraction from ws.send
    ws.sendB64 = function(e){
        this.send(btoa(e));

        transport.parceler.transmitData += e.length;
        settings.setNetTraffic(transport.parceler.transmitData, false);
    };

    // Set the sidenav websocket proxy color to green
    document.getElementById('websockURL').classList.add('brightgreen')
}

// Initialises xtermjs
function termInit() {
    // Define the terminal rows/cols
    term = new Terminal({
        cols: 80,
        rows: 24
    });
    
    // start xterm.js
    term.open(document.getElementById('terminal'), true);
    term.fit()
    term.focus()

    // set the color scheme to whatever the user's changed it to in the mean time
    var colName = document.getElementById('currentColor').innerHTML
    for(i = 0; i < settings.colorSchemes.length; i++) {
        if ( settings.colorSchemes[i][0] == colName ) {
            settings.setColorScheme(i)
            break
        }
    }
    
    // clear the modal elements on screen
    document.getElementById('load-container').style.display = "none";
    document.getElementById('login_cred').style.display = "none";
}

// Binds custom listener functions to xtermjs's Terminal object
function startxtermjs() {
    console.log('function startxterm from index.js called')
    termInit();

    // sets up some listeners for the terminal (keydown, paste)
    term.textarea.onkeydown = function(e) {
        // Sanity Checks
        if (!ws || !transport || transport.auth.failedAttempts >= 5 || transport.auth.awaitingAuthentication) {
            return;
        }

        // So we don't spam single control characters
        if (e.key.length > 1 && (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) && e.key != "Backspace") {
            return;
        }

        // We've already authenticated so now any keypress is a command for the SSH server
        var command, pressedKey;

        /** IE isn't very good so it displays one character keys as full names in .key 
         EG - e.key = " " to e.key = "Spacebar"	
         so assuming .char is one character we'll use that instead **/
        if (e.char && e.char.length == 1) {
            pressedKey = e.char;
        } else { 
            pressedKey = e.key
        }

        // Decides if the keypress is an alphanumeric character or needs escaping
        if (pressedKey.length == 1 && (!(e.altKey || e.ctrlKey || e.metaKey) || (e.altKey && e.ctrlKey))) {
            command = pressedKey;
        } else if (pressedKey.length == 1 && (e.shiftKey && e.ctrlKey)) {
            // allows ctrl + shift + v for pasting
            if (pressedKey != 'V') {
                e.preventDefault();
                return;
            }
        } else {
            //xtermjs is kind enough to evaluate our special characters instead of having to translate every char ourself
            command = term._evaluateKeyEscapeSequence(e).key;
        }

        // Decide if we're going to locally' echo this key or not
        if (settings.localEcho) {
            settings.parseKey(e);
        }
        /* Regardless of local echo we still want a reply to confirm / update terminal
           could be controversial? but putty does this too (each key press shows up twice)
           Instead we're checking the our locally echoed key and replacing it if the
           recieved key !== locally echoed key */
        return command === null ? null : transport.expect_key(command);
    };

    term.textarea.onpaste = function(ev) {
        var text 

        // Yay IE11 stuff!
        if ( window.clipboardData && window.clipboardData.getData ) {
            text = window.clipboardData.getData('Text')
        } else if ( ev.clipboardData && ev.clipboardData.getData ) {
            text = ev.clipboardData.getData('text/plain');
        }
                
        if (text) {
            // Just don't allow more than 1 million characters to be pasted.
            if(text.length < 1000000){
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
    };
}