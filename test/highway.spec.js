/**
 * @license highway https://github.com/cosmios/highway
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2014-2015 Olivier Scherrer <pode.fr@gmail.com>
 */
var Highway = require("../index"),
    Observable = require("watch-notify");

describe("Given Highway", function () {
    var highway;

    describe("When initialized", function () {
        beforeEach(function () {
            highway = new Highway();
        });

        describe("When adding routes", function () {
            var routeHandler1, routeHandler2,
                routeHandle1, routeHandle2;

            beforeEach(function () {
                routeHandler1 = jasmine.createSpy();
                routeHandler2 = jasmine.createSpy();

                routeHandle1 = highway.set("route1", routeHandler1);
                routeHandle2 = highway.set("route2", routeHandler2);
            });

            describe("When navigating to a route", function () {
                beforeEach(function () {
                    highway.navigate("route1");
                });

                it("Then calls the appropriate handler", function () {
                    expect(routeHandler1).toHaveBeenCalled();
                });
            });

            describe("When navigating to a route with parameters", function () {
                beforeEach(function () {
                    highway.navigate("route2", "param1", "param2", "param3", ["param4"]);
                });

                it("Then calls the appropriate handler with the supplied parameters", function () {
                    expect(routeHandler2).toHaveBeenCalledWith("param1", "param2", "param3", ["param4"]);
                });

                describe("When navigating to another route", function () {
                    beforeEach(function () {
                        highway.navigate("route1");
                    });

                    it("Then updates the history count", function () {
                        expect(highway.getHistoryCount()).toBe(2);
                    });

                    describe("When calling back", function () {
                        beforeEach(function () {
                            routeHandler2.reset();
                            highway.back();
                        });

                        it("Then calls the previous route", function () {
                            expect(routeHandler2).toHaveBeenCalledWith("param1", "param2", "param3", ["param4"]);
                        });

                        describe("When calling forward", function () {
                            beforeEach(function () {
                                routeHandler1.reset();
                                highway.forward();
                            });

                            it("Then calls the next route", function () {
                                expect(routeHandler1).toHaveBeenCalled();
                            });

                            it("Then doesn't affect the history count", function () {
                                expect(highway.getHistoryCount()).toBe(2);
                            });

                            describe("When clearing the history", function () {
                                beforeEach(function () {
                                    highway.clearHistory();
                                });

                                it("Then resets the history count", function () {
                                    expect(highway.getHistoryCount()).toBe(0);
                                });

                                describe("When navigating back", function () {
                                    beforeEach(function () {
                                        routeHandler2.reset();
                                        highway.back();
                                    });

                                    it("Then doesn't navigate to the previous route", function () {
                                        expect(routeHandler2).not.toHaveBeenCalled();
                                    });
                                });
                            });
                        });
                    });
                });

                describe("When removing the route", function () {
                    beforeEach(function () {
                        highway.unset(routeHandle2);
                    });

                    describe("And navigating to it", function () {
                        beforeEach(function () {
                            routeHandler2.reset();
                            highway.navigate("route2");
                        });

                        it("Then doesn't call the handler anymore", function () {
                            expect(routeHandler2).not.toHaveBeenCalled();
                        });
                    });
                });
            });

            describe("When navigating to a route that doesn\"t exist", function () {
                it("Then doesn't throw an error", function () {
                    expect(function () {
                        highway.navigate("non-route")
                    }).not.toThrow();
                });
            });

            describe("When watching for route changes", function () {
                var routeChangeHandler,
                    routeChangeHandle;

                beforeEach(function () {
                    routeChangeHandler = jasmine.createSpy();
                    routeChangeHandle = highway.watch(routeChangeHandler);
                });

                describe("And the route changes", function () {
                    beforeEach(function () {
                        highway.navigate("route1");
                    });

                    it("Then calls the route change handler", function () {
                        expect(routeChangeHandler).toHaveBeenCalledWith("route1");
                    });

                    describe("When not listening to route changes anymore", function () {
                        beforeEach(function () {
                            highway.unwatch(routeChangeHandle);
                        });

                        describe("And the route changes", function () {
                            beforeEach(function () {
                                routeChangeHandler.reset();
                                highway.navigate("route1");
                            });

                            it("Then doesn't trigger the route change handler", function () {
                                expect(routeChangeHandler).not.toHaveBeenCalled();
                            });
                        });
                    });
                });
            });
        });
    });
});