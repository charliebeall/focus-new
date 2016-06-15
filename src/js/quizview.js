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
                    layerId: choiceModel.get('sceneId')
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
            var $el = $("<div class='row share-row'><div class='col-12 col-sm-4'><a href='https://twitter.com/intent/tweet?status=@focusongeography @americangeo I just completed this Geo Quiz: [URL] with a score of'><span class='fa fa-twitter'></span></a></div><div class='col-12 col-sm-4'><a href='http://www.facebook.com/sharer/sharer.php?u=[URL]&title=[TITLE]'><span class='fa fa-facebook'></span></a></div></div>");
            var shareView = new Focus.Views.ShareView({
                el: $el
            });
            var modal = new Focus.Views.ModalView({
                model: new Focus.Models.ModalModel({
                    title: 'Congratulations!',
                    content: "You've just completed this Geo Quiz with a score of " + this._scoreView._score + " out of " + this._questionViews.length + "! Challenge your friends:" + shareView.render().$el.html(),
                    buttonText: 'OK',
                    showFooter: false
                })
            });
            modal.render().show();
        }
    }
});
