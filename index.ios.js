'use strict';

var React = require('react-native')
var shittyQs = require('shitty-qs')
var config = require('./config.js')

var {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  LinkingIOS
} = React

function dropboxOauth (app_key, callback) {
  var state = Math.random() + ''

  LinkingIOS.addEventListener('url', handleUrl)

  function handleUrl (event) {
    var [, query_string] = event.url.match(/\#(.*)/)
    var query = shittyQs(query_string)
    if (state === query.state) {
      callback(null, query.access_token, query.uid)
    } else {
      callback(new Error('Oauth2 security error'))
    }
    LinkingIOS.removeEventListener('url', handleUrl)
  }

  LinkingIOS.openURL([
    'https://www.dropbox.com/1/oauth2/authorize',
    '?response_type=token',
    '&client_id=' + app_key,
    '&redirect_uri=oauth2example://foo',
    `&state=${state}`
  ].join(''))
}

var OauthExample = React.createClass({
  componentDidMount: function () {
    dropboxOauth(config.app_key, (err, access_token) => {
      if (err) { console.log(err) }
      this.setState({ access_token: access_token })
    })
  },
  onMakeFolderPressed: function () {
    fetch(
      'https://api.dropbox.com/1/fileops/create_folder',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.state && this.state.access_token}`
        },
        body: `root=auto&path=${Math.random()}`
      }
    )
  },
  render: function() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}>
          Welcome to React Native!
        </Text>
        <Text style={styles.instructions}>
          To get started, edit index.ios.js
        </Text>
        <Text style={styles.instructions}>
          Press Cmd+R to reload,{'\n'}
          Cmd+Control+Z for dev menu
        </Text>
        <Text style={styles.instructions}>
          Access Token: {this.state && this.state.access_token}
        </Text>
        <TouchableHighlight
          onPress={this.onMakeFolderPressed.bind(this)}>
          <Text>Make Folder</Text>
        </TouchableHighlight>
      </View>
    );
  }
});

var styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  }
});

AppRegistry.registerComponent('OauthExample', () => OauthExample);
