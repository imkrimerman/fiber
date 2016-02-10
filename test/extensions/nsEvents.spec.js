describe('Fiber.Extension.NsEvents', function() {

  before(function() {
    makeSpyable(this);
  });

  beforeEach(function() {
    this.Class = new Fiber.Class();
    this.Class.applyExtension('NsEvents');
  });

  it('should apply `eventsNs` and `eventsCatalog` default values', function() {
    expect(this.Class).to.have.property('eventsNs');
    expect(this.Class).to.have.property('eventsCatalog');
    expect(this.Class.eventsNs).to.eql('');
    expect(this.Class.eventsCatalog).to.eql({});
  });

  it('should `fire` event with arguments', function(done) {
    var trigger = this.addSpy(this.Class, 'trigger'),
        nsEvent = this.addSpy(this.Class, 'nsEvent'),
        cb = this.addSpy(function() { done() });

    this.Class.when('event', cb);
    this.Class.fire('event');
    expect(nsEvent).to.be.calledOnce;
    expect(trigger).to.be.calledOnce;
    expect(cb).to.be.calledOnce;
  });

  it('should attach listener `when` every time event triggered with namespace and with catalog look up', function(done) {
    var listenTo = this.addSpy(this.Class, 'listenTo'),
        nsEvent = this.addSpy(this.Class, 'nsEvent'),
        cb = this.addSpy(function() { done() });

    this.Class.when('event', cb);
    expect(nsEvent).to.be.calledOnce;
    expect(listenTo).to.be.calledOnce;
    this.Class.fire('event');
    expect(cb).to.be.calledOnce;
  });

  it('should attach listener `after` once event triggered with namespace and with catalog look up', function(done) {
    var listenToOnce = this.addSpy(this.Class, 'listenToOnce'),
        nsEvent = this.addSpy(this.Class, 'nsEvent'),
        cb = this.addSpy(function() { done() });

    this.Class.after('event', cb);
    expect(nsEvent).to.be.calledOnce;
    expect(listenToOnce).to.be.calledOnce;
    this.Class.fire('event');
    expect(cb).to.be.calledOnce;
  });

  it('should return namespaced event or if `!` - event without ns, if `!@` - event without ns and catalog', function() {
    this.Class.eventsNs = 'class';
    this.Class.eventsCatalog = {
      one: 'catalog:one'
    };

    expect(this.Class.nsEvent('event')).to.eql(this.Class.eventsNs + ':event');
    expect(this.Class.nsEvent('one')).to.eql(this.Class.eventsNs + ':' + this.Class.eventsCatalog.one);
    expect(this.Class.nsEvent('@one')).to.eql('one');
    expect(this.Class.nsEvent('!one')).to.eql(this.Class.eventsNs + ':one');

    this.Class.eventsNs = '';
    expect(this.Class.nsEvent('event')).to.eql('event');
    expect(this.Class.nsEvent('one')).to.eql(this.Class.eventsCatalog.one);
    expect(this.Class.nsEvent('@one')).to.eql('one');
    expect(this.Class.nsEvent('!one')).to.eql('one');
  });

  it('should return (`get`) event from catalog, otherwise same as input', function() {
    this.Class.eventsCatalog = {
      one: 'catalog:one'
    };
    expect(this.Class.getCatalogEvent('one')).to.eql(this.Class.eventsCatalog.one);
    expect(this.Class.getCatalogEvent('two')).to.eql('two');
  });

  it('should `set` event to the catalog', function() {
    this.Class.setCatalogEvent('event', 'event:foo');
    expect(this.Class.eventsCatalog).to.have.property('event');
    expect(this.Class.eventsCatalog.event).to.eql('event:foo');
  });

  afterEach(function() {
    this.clearSpies();
  });

});
