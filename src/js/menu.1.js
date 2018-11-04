var Focus = Focus || {};
Focus.Models = Focus.Models || {};
Focus.Collections = Focus.Collections || {};
Focus.Views = Focus.Views || {};

Focus.Models.ItemModel = Backbone.Model.extend({
    defaults: {
        visible: true
    }
});

Focus.Collections.ItemCollection = Backbone.Collection.extend({
   model: Focus.Models.ItemModel
});

Focus.Views.MenuItemView = Backbone.View.extend({
    className: '', //'row',
    tagName: 'div',
    template: _.template($('#menu-item-template').html()),
    initialize: function (options) {
        this.listenTo(this.model, 'change', this.render);
    },
    render: function () {
        this.$el.html(this.template(this.model.attributes));
        return this;
    }
});

Focus.Views.MenuItemsView = Backbone.View.extend({
    className: 'row', //'col-12 col-sm-12',
    template: _.template($('#menu-items-template').html()),
    initialize: function (options) {
        this._basePath = options.basePath || '../../../';
        this.listenTo(this.collection, 'add', this.addItem);
    },
    render: function () {
        this.$el.html(this.template(this.model.attributes));
        return this;
    },
    addItem: function (model, collection, options) {
        model.set('thumbnail', this._basePath + model.get('thumbnail'));
        model.set('url', this._basePath + model.get('url'));
		model.set('publicationCount', collection.size());
		model.set('index', options.index);
        var view = new Focus.Views.MenuItemView({
            model: model
        });
        this.$el.find('.items').append(view.render().el);
        return this;
    }
});

Focus.Models.FilterModel = Backbone.Model.extend({
    defaults: {
        filters: {
            'Feature Article': true,
            'Photo Essay': true,
            'Geo Quiz': true
        }
    }
});
Focus.Views.MenuHeaderView = Backbone.View.extend({
    className: 'row',
    template: _.template($('#menu-header-template').html()),
    events: {
        'click .btn': 'toggleFilter'
    },
    initialize: function (options) {
        this.model = new Focus.Models.FilterModel();
        this.listenTo(this.model, 'change', this.render);
    },
    toggleFilter: function (e) {
        e.preventDefault();
        var me = this;
        var $target = $(e.target);
        var dataType = $target.attr('data-type');
        var filters = me.model.get('filters');

        if (dataType in filters) {
            delete filters[dataType];
        }
        else {
            filters[dataType] = true;
        }

        me.model.set('filters', filters);
        this.trigger('filter', me.model.get('filters'));
    },    
    render: function () {
        this.$el.html(this.template(this.model.attributes));
        return this;
    }
});

Focus.Views.MenuView = Backbone.View.extend({
    el: $('#menu'),
    initialize: function (options) {
        options = options || {};
        options.mode = options.mode || 'hamburger';

        this._basePath = options.basePath || '../../../';

        if (options.mode === 'hamburger') {
            this.initHamburger();
        }

        this.volumes = JSON.parse(JSON.stringify(Focus.Volumes));
        this.filters = {};
    },
    initHamburger: function () {
        var beginAC = 80,
            endAC = 320,
            beginB = 80,
            endB = 320;

        function inAC(s) {
            s.draw('80% - 240', '80%', 0.3, {
                delay: 0.1,
                callback: function() {
                    inAC2(s)
                }
            });
        }

        function inAC2(s) {
            s.draw('100% - 545', '100% - 305', 0.6, {
                easing: ease.ease('elastic-out', 1, 0.3)
            });
        }

        function inB(s) {
            s.draw(beginB - 60, endB + 60, 0.1, {
                callback: function() {
                    inB2(s)
                }
            });
        }

        function inB2(s) {
            s.draw(beginB + 120, endB - 120, 0.3, {
                easing: ease.ease('bounce-out', 1, 0.3)
            });
        }

        /* Out animations (to burger icon) */

        function outAC(s) {
            s.draw('90% - 240', '90%', 0.1, {
                easing: ease.ease('elastic-in', 1, 0.3),
                callback: function() {
                    outAC2(s)
                }
            });
        }

        function outAC2(s) {
            s.draw('20% - 240', '20%', 0.3, {
                callback: function() {
                    outAC3(s)
                }
            });
        }

        function outAC3(s) {
            s.draw(beginAC, endAC, 0.7, {
                easing: ease.ease('elastic-out', 1, 0.3)
            });
        }

        function outB(s) {
            s.draw(beginB, endB, 0.7, {
                delay: 0.1,
                easing: ease.ease('elastic-out', 2, 0.4)
            });
        }

        /* Awesome burger default */

        function addScale(m) {
            m.className = 'menu-icon-wrapper scaled';
        }

        function removeScale(m) {
            m.className = 'menu-icon-wrapper';
        }

        /* Awesome burger scaled */

        var pathD = document.getElementById('pathD'),
            pathE = document.getElementById('pathE'),
            pathF = document.getElementById('pathF'),
            segmentD = new Segment(pathD, beginAC, endAC),
            segmentE = new Segment(pathE, beginB, endB),
            segmentF = new Segment(pathF, beginAC, endAC),
            wrapper2 = document.getElementById('menu-icon-wrapper2'),
            trigger2 = document.getElementById('menu-icon-trigger2'),
            toCloseIcon2 = true,
            dummy2 = document.getElementById('dummy2');

        wrapper2.style.visibility = 'visible';

        trigger2.onclick = function() {
            addScale(wrapper2);
            if (toCloseIcon2) {
                inAC(segmentD);
                inB(segmentE);
                inAC(segmentF);
            } else {
                outAC(segmentD);
                outB(segmentE);
                outAC(segmentF);
            }
            toCloseIcon2 = !toCloseIcon2;
            setTimeout(function() {
                removeScale(wrapper2)
            }, 450);

            $('#main-nav').toggleClass('expanded');
        };
    },
    filter: function (filters) {
        var me = this;
        _.each(this.volumes, function (volume) {
            _.each(volume.publications, function (publication) {
                publication.visible = publication.type in filters;
            });
        });
        this.render();
    },
    render: function () {
        var me = this;

        
        if (!this.headerView) {
            this.headerView = new Focus.Views.MenuHeaderView();
            me.$el.append(this.headerView.render().el);
            this.listenTo(this.headerView, 'filter', this.filter);
            me.$el.append('<div class="sub-items"></div>');
        }

        var $subItems = me.$el.find('.sub-items');
        $subItems.empty();

        _.each(this.volumes, function (volume) {
            var view = new Focus.Views.MenuItemsView({
                basePath: me._basePath,
                model: new Backbone.Model({
                    text: 'Publications'
                }),
                collection: new Focus.Collections.ItemCollection()
            });
            $subItems.append('<h2 class="volume-number">Volume ' + volume.number + '</h2>');
            $subItems.append(view.render().el);
            view.collection.add(volume.publications);
        });

        return this;
    }
});

var menuView = new Focus.Views.MenuView();
menuView.render();

var $footer = $('.footer-row');
var yearText = 2016;
var currentYear = new Date().getFullYear();

yearText = currentYear > yearText ? yearText + '-' + currentYear : yearText;
$footer.html('<div class="col-lg-6 col-md-6 col-sm-12 col-xs-12">© ' + yearText + ' <a href="//americangeo.org" target="_blank">American Geographical Society</a>.  All Rights Reserved.</div><div class="col-lg-6 col-md-6 col-sm-12 col-xs-12"><span class="pull-right">Site design by <a href="https://github.com/sfairgrieve" target="_blank">Scott Fairgrieve</a>, <a href="//www.thehumangeo.com" target="_blank">HumanGeo</a></span></div>');
