const Telnet = require('telnet-client');
const randToken = require('rand-token');

/**
 * @module Helpers
 * @description Helper functions
 */

module.exports = {


    friendlyName: 'Create web token',


    description: 'Connects to telnet, adds webtokens to the server and returns these',


    inputs: {

        ip: {
            type: 'string',
            description: 'IP address of server to connect to',
            required: true
        },

        port: {
            type: 'number',
            description: 'Telnet port',
            required: true
        },

        password: {
            type: 'string',
            description: 'Telnet password',
            required: true
        }

    },


    exits: {
        success: {
            outputFriendlyName: 'Connected and tokens added'
        },
        timeout: {
            outputFriendlyName: 'Connection timed out'
        },
        failedLogin: {
            outputFriendlyName: 'Could not log in to telnet'
        }

    },

    /**
     * @description Executes webtokens add command on a server
     * @name createWebTokens
     * @memberof module:Helpers
     * @returns {json} Authname and token
     * @method
     * @param {string} ip 
     * @param {number} port Telnet port
     * @param {string} password Telnet password
     */

    fn: async function(inputs, exits) {
        const authName = 'CSMM';
        const authToken = randToken.generate(32);

        let connection = new Telnet();
        let params = {
            host: inputs.ip,
            port: inputs.port,
            timeout: 3000,
            password: inputs.password,
            failedLoginMatch: 'Password incorrect',
            passwordPrompt: /Please enter password:/i,
            shellPrompt: /\r\n$/,
        };
        connection.connect(params);



        connection.on('ready', function(prompt) {
            connection.exec(`webtokens add ${authName} ${authToken} 0`, function(err, response) {
                if (err) { return exits.error(err); }
                if (_.isUndefined(response) || response.length <= 0) {
                    return exits.error(new Error('No response from telnet server'));
                } else {
                    return exits.success({ authName: authName, authToken: authToken });
                }

            });
        });

        connection.on('failedlogin', function() {
            return exits.failedLogin();
        });

        connection.on('error', function(error) {
            return exits.error(new Error(error));
        });


    }


};