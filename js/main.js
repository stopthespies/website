

var legislatorTemplate = $('#legislator-template').html();
var legislators = {
  'H6V': { 
    name: 'John Brown',
    title: 'Senator',
    image: 'H6V'
  },
  'YE4': {
    name: 'Sarah Pale',
    title: 'Senator',
    image: 'YE4'
  },
  '2L6': {
    name: 'Steve Gates',
    title: 'Senator',
    image: '2L6'
  }
};
_.each(legislators, function (legislator) {
  console.log(legislator);
  $('.legislators').append(_.template(legislatorTemplate, legislator));

})
$('.metric').popover({
  trigger: 'hover',
  container: 'body',
  placement: 'top'
});

$('.support img').popover({
  trigger: 'hover',
  container: 'body',
  placement: 'top'
});
$('.contact li').popover({
  trigger: 'hover',
  container: 'body',
  placement: 'top'
});
$('body').on('click', '.contact .call-action', function (e) {
  var legislatorId = $(e.currentTarget).parents('.legislator').attr('data-legislator-id');
  var legislator = legislators[legislatorId];
  var callModalTemplate = $('#call-modal-template').html();
  $('#call-modal-container').html(_.template(callModalTemplate, legislator));
  $('#call-modal-container .modal').modal();
});

$('body').on('click', '.contact .email-action', function (e) {
  var legislatorId = $(e.currentTarget).parents('.legislator').attr('data-legislator-id');
  var legislator = legislators[legislatorId];
  var emailModalTemplate = $('#email-modal-template').html();
  $('#email-modal-container').html(_.template(emailModalTemplate, legislator));
  $('#email-modal-container .modal').modal();
  $('#email-modal').modal();
});