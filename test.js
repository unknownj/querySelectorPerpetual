describe("querySelectorPerpetual", function () {
  beforeEach(function () {
    document.body.innerHTML = `
      <div id="container">
        <div class="item">Item 1</div>
        <div class="item">Item 2</div>
      </div>
    `;
  });

  it("should apply forEach to existing elements", function () {
    var spy = sinon.spy();
    querySelectorPerpetual(".item").forEach(spy);
    expect(spy.callCount).to.equal(2);
  });

  it("should apply forEach to newly added elements", function (done) {
    var spy = sinon.spy();
    querySelectorPerpetual(".item").forEach(spy);

    var newItem = document.createElement("div");
    newItem.classList.add("item");
    newItem.textContent = "Item 3";
    document.querySelector("#container").appendChild(newItem);

    setTimeout(function () {
      expect(spy.callCount).to.equal(3);
      done();
    }, 100);
  });

  it("should apply map to existing elements", function () {
    var result = querySelectorPerpetual(".item").map(function (element) {
      return element.textContent;
    });
    expect(result).to.deep.equal(["Item 1", "Item 2"]);
  });

  it("should apply map to newly added elements", function (done) {
    var result = querySelectorPerpetual(".item").map(function (element) {
      return element.textContent;
    });

    var newItem = document.createElement("div");
    newItem.classList.add("item");
    newItem.textContent = "Item 3";
    document.querySelector("#container").appendChild(newItem);

    setTimeout(function () {
      expect(result).to.deep.equal(["Item 1", "Item 2", "Item 3"]);
      done();
    }, 100);
  });

  it("should apply filter to existing elements", function () {
    var result = querySelectorPerpetual(".item").filter(function (element) {
      return element.textContent === "Item 1";
    });
    expect(result.length).to.equal(1);
    expect(result[0].textContent).to.equal("Item 1");
  });

  it("should apply filter to newly added elements", function (done) {
    var result = querySelectorPerpetual(".item").filter(function (element) {
      return element.textContent === "Item 1";
    });

    var newItem = document.createElement("div");
    newItem.classList.add("item");
    newItem.textContent = "Item 3";
    document.querySelector("#container").appendChild(newItem);

    setTimeout(function () {
      expect(result.length).to.equal(1);
      expect(result[0].textContent).to.equal("Item 1");
      done();
    }, 100);
  });

  it("should apply sort to existing elements", function () {
    var result = querySelectorPerpetual(".item").sort(function (a, b) {
      return a.textContent.localeCompare(b.textContent);
    });
    expect(result[0].textContent).to.equal("Item 1");
    expect(result[1].textContent).to.equal("Item 2");
  });

  it("should apply sort to newly added elements", function (done) {
    var result = querySelectorPerpetual(".item").sort(function (a, b) {
      return a.textContent.localeCompare(b.textContent);
    });

    var newItem = document.createElement("div");
    newItem.classList.add("item");
    newItem.textContent = "Item 0";
    document.querySelector("#container").appendChild(newItem);

    setTimeout(function () {
      expect(result[0].textContent).to.equal("Item 0");
      expect(result[1].textContent).to.equal("Item 1");
      expect(result[2].textContent).to.equal("Item 2");
      done();
    }, 100);
  });
});