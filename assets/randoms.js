/**
 * Random people and story generator
 *
 * This pulls people and details out of randomuser.me and then combines them into
 * random snippets of information shown as examples of potentially identifying metadata.
 *
 * A 'story' is a pipeline of operations that userdata can pass through, starting with a
 * base template to fill and ending in combined text output after applying several random
 * inbetween templates to the data.
 *
 * The end result is a random, branching structure which results in hopefully a good number
 * of leaf nodes at the base of the decision tree.
 *
 * Yes, I had quite a lot of fun with this :p
 *
 * @author  Sam Pospischil <pospi@spadgos.com>
 * @since   2014-09-20
 */


(function($, STS) {

// Define story entrypoints //------------------------------------------------------------------------------------------

var stories = [
  function email(people)
  {
    // {
      // ip : randomPublicIP(),
      // time : new Date(),
      // personA :
      // personB :
      // address :
      // addressB :
    // }
  },
  function webhistory()
  {

  },
  function location()
  {

  }
];

// Define templates //--------------------------------------------------------------------------------------------------

var templates = {
  'base' : "\
    <h4><%= header %></h4>\
    <p><%= body %></p>\
    ",
  //--------------------------------------
  'header' : "<span class=\"time\"><%= time %></span> <%= personA %>",
  //--------------------------------------
  'body' : {
    'email' : [
      "emailed <%= personB %>, subject: <%= subject %>"
    ],
    'web' : [
      "Visited <%= url %> (<%= ip %>)",
      "Visited <%= url %> (<%= ip %>), viewed article <%= article %>",
      "Searched <%= shoppingsite %> for <%= product %>",
      "Read article <%= article %> on <%= newssite %>",
      "Watched video <%= shoppingsite %> on <%= videosite %>",
    ],
    'location' : [
      "GPS active: currently located at <%= address %>",
      "Accessed <%= socialnetwork %>, GPS inactive. <%= randomnum %> nearby wifi stations, triangulating... approximate location <%= address %>",
      "Contacts syncing, GPS inactive. <%= randomnum %> nearby cell towers, triangulating... approximate location <%= address %>",
      "Navigating from <%= address %> to <%= addressB %>, current ETA <%= randomtime %>",
      "Was on <%= personB %>'s wifi, service address <%= address %>. Adding to known associates...",
      "Met <%= personB %> at corner of <%= addressB %> and <%= address %>"
    ]
  }
};

// Define non-randomuser template variables //--------------------------------------------------------------------------

var templateVars = {
  'subject' : [
    "Money troubles",
    "Let's meet up"
  ],
  'url' : [

  ],
  'newssite' : [

  ],
  'shoppingsite' : [

  ],
  'article' : [

  ],
  'product' : [

  ],
  'socialnetwork' : [

  ],
  'videosite' : [

  ],
  'randomnum' : function() {
    return Math.ceil(Math.random() * 6);
  },
  'randomtime' : function() {
    var d = new Date(Math.random() * 1000 * 60 * 30);
    var mins = d.getMinutes();
    if (mins < 10) {
      mins = "0" + mins;
    }
    return d.getHours() + ':' + mins;
  }
};

// Story builder //-----------------------------------------------------------------------------------------------------

function Template()
{

}

Template.prototype.combine = function(person1, person2, data)
{
  // if var is in data, apply & return

  // if var is in templateVars:
    // if array, choose random & return (:TODO: weight this)
    // if function, return result

  // if subtemplate key exists:
    // if string, render data to string (recurse)
    // else if object, read instance config key to choose next level (i.e. template.config.body = 'email')

  // all else failing, BAM make error. Cos it should never happen if you're careful with the configuration. Oh god what have i done.
};

Template.prototype.finalize = function()
{
  // :TODO: add a timestamp data header and exit
};

// Random IP addresses //-----------------------------------------------------------------------------------------------

function randomPublicIP()
{
  // create random 32-bit int
  var seed = Math.floor(Math.random() * 4294967296);

  // try again if this is a reserved address (lazy)
  if ((seed >= 167772160 /* 10.0.0.0 */ && seed <= 184549145 /* 10.255.255.25 */)
   || (seed >= 2886729728 /* 172.16.0.0 */ && seed <= 2887778303 /* 172.31.255.255 */)
   || (seed >= 3232235520 /* 192.168.0.0 */ && seed <= 3232301055 /* 192.168.255.255 */)) {
    return randomPublicIP();
  }

  return numToIP(seed);
}

function numToIP(num)
{
  return ((num >> 24) & 0xFF) + '.'
       + ((num >> 16) & 0xFF) + '.'
       + ((num >> 8) & 0xFF) + '.'
       + (num & 0xFF);
}

// Person cache / reader (no duplicates!) //----------------------------------------------------------------------------

function PersonStack()
{

}


// Load initial peopleset //--------------------------------------------------------------------------------------------

var people;

$.ajax({
  url: 'http://api.randomuser.me/0.4.1/?results=40',
  dataType: 'json',
  success: function(data) {
    people = data;
  }
});

})(jQuery, STS);
