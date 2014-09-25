// ;)
(function () {
    var index = 0;
    var titles = [
        '"There was of course no way of knowing whether you were being watched at any given moment. How often, or on what system, the Thought Police plugged in on any individual wire was guesswork." - 1984',
        '"It was even conceivable that they watched everybody all the time. But at any rate they could plug in your wire whenever they wanted to." - 1984',
        '"You had to live—did live, from habit that became instinct—in the assumption that every sound you made was overheard, and, except in darkness, every movement scrutinized." - 1984',
        '"Regrettably, for some time to come, the delicate balance between freedom and security may have to shift." - Tony Abbott',
        '"He might be a bad boss but at least he\'s employing someone while he is in fact a boss." - Tony Abbott',
        '"If we\'re honest, most of us would accept that a bad boss is a little bit like a bad father or a bad husband... you find that he tends to do more good than harm." - Tony Abbott',
        '"Regrettably, for some time to come, Australians will have to endure more security than we’re used to, and more inconvenience than we’d like." - Tony Abbott',
        '"Doublethink means the power of holding two contradictory beliefs in one’s mind simultaneously, and accepting both of them." - 1984',
        'You can stop this.'
    ];

    function getTitle() {
        if (index === titles.length) {
            index = 0;
        }

        return titles[index++];
    }

    var $eyemarks = $('.introduction .eyemarks');
    // $eyemarks.on('mouseover', 'img', function () {
    //     $(this).attr('title', getTitle());
    // });
    // $eyemarks.on('mouseout', 'img', function () {
    //     $(this).removeAttr('title');
    // });

    $eyemarks.find('img')
        .each(function () {
            this.title = getTitle();
        })
        .tooltipster({
            delay: 400,
            maxWidth: 300,
            theme: 'tooltipster-eyes'
        });
})();
// ;)
