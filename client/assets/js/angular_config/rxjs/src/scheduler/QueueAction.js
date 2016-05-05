System.register(['./FutureAction'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    var FutureAction_1;
    var QueueAction;
    return {
        setters:[
            function (FutureAction_1_1) {
                FutureAction_1 = FutureAction_1_1;
            }],
        execute: function() {
            /**
             * We need this JSDoc comment for affecting ESDoc.
             * @ignore
             * @extends {Ignored}
             */
            QueueAction = (function (_super) {
                __extends(QueueAction, _super);
                function QueueAction() {
                    _super.apply(this, arguments);
                }
                QueueAction.prototype._schedule = function (state, delay) {
                    if (delay === void 0) { delay = 0; }
                    if (delay > 0) {
                        return _super.prototype._schedule.call(this, state, delay);
                    }
                    this.delay = delay;
                    this.state = state;
                    var scheduler = this.scheduler;
                    scheduler.actions.push(this);
                    scheduler.flush();
                    return this;
                };
                return QueueAction;
            }(FutureAction_1.FutureAction));
            exports_1("QueueAction", QueueAction);
        }
    }
});
//# sourceMappingURL=QueueAction.js.map