Focus.Models.ChoiceModel = Backbone.Model.extend({
    defaults: function () {
        return {
            selected: false,
            result: '',
            photo: null,
            text: '',
            id: '',
            sceneId: null
        };
    }
});

Focus.Collections.ChoiceCollection = Backbone.Collection.extend({
    model: Focus.Models.ChoiceModel
});

Focus.Models.QuestionModel = Backbone.Model.extend({
    showResults: function () {
        var choices = this.get('choices');
        var rightAnswer = this.get('rightAnswer');

        choices.each(function (choice) {
            choice.set('result', choice.id === rightAnswer.id ? 'right' : 'wrong');
        });
    },
    isCorrect: function () {
        var choices = this.get('choices');
        var rightAnswer = this.get('rightAnswer');
        var selectedChoice = choices.findWhere({
            selected: true
        });

        return selectedChoice && (selectedChoice.id === rightAnswer.id);
    }
});

Focus.Collections.QuestionCollection = Backbone.Collection.extend({
    model: Focus.Models.QuestionModel
});

Focus.Views.ChoiceView = Backbone.View.extend({
    tagName: 'div',
    className: 'choice col-12 col-sm-2 col-xs-2',
    events: {
        'click': 'select'
    },
    template: _.template($('#choice-template').html()),
    initialize: function (options) {
        this.listenTo(this.model, 'change', this.render);
    },
    select: function (e) {
        e.preventDefault();
        this.trigger('selected', this.model);
    },
    render: function () {
        this.$el.html(this.template(this.model.attributes));
        return this;
    }
});

Focus.Views.QuestionView = Backbone.View.extend({
    tagName: 'section',
    className: 'scene container-fluid',
    events: {
        'click .check-answer': 'checkAnswer',
        'click .next': 'next'
    },
    template: _.template($('#question-template').html()),
    initialize: function (options) {
        this.listenTo(this.model, 'change', this.render);
        this.listenTo(Focus.Events, 'layerClick', this.selectChoice);
    },
    render: function () {
        var me = this;

        if (!this._rendered) {
            this.$el.html(this.template(this.model.attributes));

            var $choices = this.$el.find('.choice-row');

            $choices.append('<div class="col-12 col-sm-1 col-xs-1"></div>');

            var choices = this.model.get('choices');
            this._choiceCollection = new Focus.Collections.ChoiceCollection(choices);
            this._choiceCollection.each(function (choiceModel, index) {
                var choiceView = new Focus.Views.ChoiceView({
                    model: choiceModel
                });
                var $choiceView = $(choiceView.render().el);
                $choiceView.hide();

                if (index === 2) {
                    $choices.append('<div class="col-12 col-sm-2 col-xs-2"></div>');
                }
                $choices.append($choiceView);
                me.listenTo(choiceView, 'selected', me.select);
            });

            $choices.append('<div class="col-12 col-sm-1 col-xs-1"></div>');

            this.listenTo(this._choiceCollection, 'change:selected', this.changeSelected);
            this.model.set('choices', this._choiceCollection, {silent: true});
            this._rendered = true;
        }
        else {
            this.$el.find('.prompt h3').html(this.model.get('prompt'));
        }

        return this;
    },
    selectChoice: function (id) {
        var selectedModel = this._choiceCollection.findWhere({
            sceneId: id
        }) || this._choiceCollection.findWhere({
        	layerId: id
        });

        if (selectedModel) {
            this.select(selectedModel);
        }
    },
    select: function (selectedModel) {
        this._choiceCollection.each(function (model) {
            model.set('selected', false);
        });
        selectedModel.set('selected', true);

        this.$el.find('.check-answer').show();
    },
    show: function () {
        $('.line').each(function () {
            $(this).remove();
        });

        var me = this;
        var $choices = this.$el.find('.choice');
        $choices.velocity('transition.slideUpIn', {stagger: 250});

        var func = function () {

            me._choiceCollection.each(function (choiceModel, index) {
                Focus.Events.trigger('drawLine', {
                    $target: $($choices[index]).find('.id-row span'),
                    layerId: choiceModel.get('sceneId') || choiceModel.get('layerId'),
                    drawStyle: 'c'
                });
            });
        };

        setTimeout(func, 2000);

        //Focus.Events.trigger('changePrompt', this.model.get('prompt'));
    },
    _toggleButtons: function () {
        this.$el.find('.check-answer').toggle();
        this.$el.find('.next').toggle();
    },
    next: function (e) {
        e.preventDefault();
        Focus.Events.trigger('next');

        this._toggleButtons();
    },

    checkAnswer: function (e) {
        e.preventDefault();

        var correct = this.model.isCorrect();

        this.model.showResults();

        if (!correct) {
            this.model.set('prompt', 'Sorry, the correct answer is ' + this.model.get('rightAnswer').id + ':  ' + this.model.get('rightAnswer').description);
        }
        else {
            this.model.set('prompt', 'Correct');
        }

        Focus.Events.trigger('incrementScore', {
            index: this.model.get('index'),
            correct: correct
        });

        this._toggleButtons();
    }
});

/*
 Focus.Views.QuizScoreView = Backbone.View.extend({
 template: _.template($('#quiz-score-template').html()),
 initialize: function (options) {
 this.model = new Backbone.Model({
 score: 0,
 total: 0
 });
 this.listenTo(this.model, 'change', this.render);
 },
 incrementScore: function (bonus) {
 this.model.set('total', this.model.get('total') + 1);
 this.model.set('score', this.model.get('score') + bonus);
 },
 render: function () {
 this.$el.html(this.template(this.model.attributes));
 return this;
 }
 });
 */

Focus.Views.PromptView = Backbone.View.extend({
    el: $('#prompt-view'),
    initialize: function (options) {
        this.listenTo(Focus.Events, 'changePrompt', this.changePrompt);
    },
    changePrompt: function (prompt) {
        this.$el.find('h3').html(prompt);
    }
});

Focus.Views.QuizSceneNavigator = Focus.Views.ButtonSceneNavigator.extend({
    events: {},
    initialize: function (options) {
        var me = this;

        this.listenTo(Focus.Events, 'next', this.next);

        this._promptView = new Focus.Views.PromptView();
        this._modalView = new Focus.Views.ModalView({
            model: this.model
        });
        this._modalView.render().show();
        this._scoreView = new Focus.Views.QuizScoreView();
        this._scoreView.render();

        this.listenTo(Focus.Events, 'incrementScore', this.incrementScore);
        var me = this;
        this._questionViews = [];
        this.collection.each(function (questionModel, index) {
            questionModel.set('index', index + 1);
            var view = new Focus.Views.QuestionView({
                model: questionModel
            });
            me._questionViews.push(view);
            view.render();
            me.$el.append(view.el);
            me.listenTo(view, 'next', me.next);
        });

        Focus.Views.ButtonSceneNavigator.prototype.initialize.call(this, options);
        me._sceneIndex = -1;
    },
    incrementScore: function (model) {
        this._scoreView.incrementScore(model);
    },
    next: function () {
        this._sceneIndex += 1;

        if (this._sceneIndex < this._questionViews.length) {
            this.changeScene(this._sceneIndex);
            this._questionViews[this._sceneIndex].show();
        }
        else {
            var $el = $("<div class='row share-row'><div class='col-12 col-xs-4'><a target='_blank' href='https://twitter.com/intent/tweet?status=#focusongeography I just completed this Geo Quiz: [URL] with a score of " + this._scoreView._score + " out of " + this._questionViews.length + "'><span class='fa fa-twitter'></span></a></div><div class='col-12 col-xs-4'><a target='_blank' href='http://www.facebook.com/sharer/sharer.php?u=[URL]&amp;title=[TITLE]'><span class='fa fa-facebook'></span></a></div><div class='col-12 col-xs-4'><a target='_blank' href='mailto:?subject=[TITLE]&amp;body=I just completed [TITLE]: [URL] with a score of " + this._scoreView._score + " out of " + this._questionViews.length + "'><span class='share-button fa fa-envelope'></span></a></div></div>");
            var shareView = new Focus.Views.ShareView({
                el: $el
            });
            var modal = new Focus.Views.ModalView({
                model: new Focus.Models.ModalModel({
                    title: 'Congratulations!',
                    content: "You've just completed this Geo Quiz with a score of " + this._scoreView._score + " out of " + this._questionViews.length + "! Challenge your friends:" + shareView.render().$el.wrap('div').parent().html(),
                    buttonText: 'OK',
                    showFooter: false
                })
            });
            modal.render().show();
        }
    }
});

/*
 index,
 complete,
 correct,
 value
 */
Focus.Models.ScoreItemModel = Backbone.Model.extend({
    defaults: function () {
        return {
            complete: false,
            correct: false,
            value: 1
        };
    }
});

Focus.Collections.ScoreItemCollection = Backbone.Collection.extend({
    model: Focus.Models.ScoreItemModel
});

Focus.Views.QuizScoreView = Backbone.View.extend({
    el: $('#score-view'),
    initialize: function (options) {
        options = options || {};
        var count = options.count || 10;
        var items = [];

        for (var i = 1; i <= count; ++i) {
            items.push({
                index: i,
                complete: false,
                correct: false,
                value: 1
            });
        }

        this.collection = new Focus.Collections.ScoreItemCollection(items);

        this._setupChart();

        this.listenTo(this.collection, 'change', this.render);

        this._score = 0;

    },
    incrementScore: function (model) {
        var found = this.collection.findWhere({
            index: model.index
        });

        if (model.correct) {
            this._score++;
        }

        found.set(model);
        found.set('complete', true);
    },
    _setupChart: function () {
        var width = this.$el.width();
        var height = this.$el.height();
        var radius = Math.min(width, height) / 2;
        this._svg = d3.select(this.$el[0])
            .append("svg")
            .append("g")

        this._svg.append("g")
            .attr("class", "slices");
        this._svg.append("g")
            .attr("class", "labels");
        this._svg.append("g")
            .attr("class", "lines");

        this._svg.attr("transform", "translate(" + radius + "," + radius + ")");
    },
    _buildPie: function () {
        var me = this;
        var width = this.$el.width();
        var height = this.$el.height();

        this.$el.find('h3').html(this._score);

        var radius = Math.min(width, height) / 2;

        var pie = d3.layout.pie()
            .sort(null)
            .value(function (d) {
                return d.value;
            });

        var arc = d3.svg.arc()
            .innerRadius(radius * 0.3)
            .outerRadius(radius * 0.4);

        var midArc = d3.svg.arc()
            .innerRadius(radius * 0.4)
            .outerRadius(radius * 0.6);

        var outerArc = d3.svg.arc()
            .innerRadius(radius * 0.8)
            .outerRadius(radius * 0.9);

        var key = function (d) {
            return d.data.index;
        };

        var change = function (data) {
            /* ------- PIE SLICES -------*/
            var slice = me._svg.select(".slices").selectAll("path.slice")
                .data(pie(data), key);

            slice.enter()
                .insert("path")
                .style("fill", function (d) {
                    if (d.data.complete) {
                        if (d.data.correct) {
                            return 'green';
                        }
                        else {
                            return 'red';
                        }
                    }
                    else {
                        return 'gray';
                    }
                })
                .style("stroke", '#333') //"rgba(0,0,0,0.25)")
                //.style("opacity", 0.5)
                .attr("class", "slice")
                .on('mouseover', function (e) {
                    //d3.select(this).style('fill', 'rgba(255,165,0,0.0)');
                })
                .on('mouseout', function (d, i) {
                    //if (!d.data.selected) {
                    //    d3.select(this).style('fill', 'rgba(255,165,0,0.5)');
                    //}
                })
                .on('click', function (d, i) {
                    //change(next(d));
                });

            slice
                .transition().duration(1000)
                .style("fill", function (d) {
                    if (d.data.complete) {
                        if (d.data.correct) {
                            return 'green';
                        }
                        else {
                            return 'red';
                        }
                    }
                    else {
                        return 'gray';
                    }
                })
                .attrTween("d", function (d) {
                    this._current = this._current || d;
                    var interpolate = d3.interpolate(this._current, d);
                    this._current = interpolate(0);
                    return function (t) {
                        return outerArc(interpolate(t));
                    };
                });

            slice.exit()
                .remove();

        };

        change(this.collection.toJSON());


    },
    render: function () {
        this._buildPie();
        return this;
    }
});

