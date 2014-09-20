/**
 * Random people and story generator
 *
 * This pulls people and details out of randomuser.me and then combines them into
 * random snippets of information shown as examples of potentially identifying metadata.
 *
 * @author  Sam Pospischil <pospi@spadgos.com>
 * @since   2014-09-20
 */

(function($, STS) {

// Define story entrypoints //------------------------------------------------------------------------------------------

var stories = [
  function email(people)
  {

  },
  function webhistory()
  {

  },
  function location()
  {

  }
];

// Define template entrypoints //---------------------------------------------------------------------------------------

var templates = [

];

// Story builder //-----------------------------------------------------------------------------------------------------

function Template()
{

}

Template.prototype.combine = function(person1, person2, data)
{

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
