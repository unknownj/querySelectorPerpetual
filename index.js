/**
 * querySelectorPerpetual listens for newly added elements that match the given selector
 * and applies specified array-like functions to them.
 *
 * @param {string} selector - A valid CSS selector
 * @param {object} [options] - An optional options object
 * @param {boolean} [options.matchExisting=true] - Whether to match existing elements
 * @param {boolean} [options.matchReappearance=false] - Whether to reapply functions to elements after re-adding them
 * @returns {object} - An object containing array-like functions that can be chained
 */
function querySelectorPerpetual(selector, options) {

  // Create a WeakMap to store which elements we've tracked
  var elementInvocationMap = new WeakMap();

  var defaultOptions = {
    matchExisting: true,
    matchReappearance: false,
    rootElement: document.querySelector("body")
  };

  options = Object.assign(defaultOptions, options || {});

  var target = options.rootElement;

  /**
   * The `operations` array stores a list of array-like operations that can be applied
   * to elements. Each operation is an object containing:
   * - `name`: The name of the operation (e.g., "forEach", "map").
   * - `func`: The actual function to execute for that operation.
   */
  var operations = [];

  /**
   * addOperation adds a new operation to the `operations` array.
   *
   * @param {string} name - The name of the operation (e.g., "forEach", "map").
   * @param {Function} func - The actual function to execute for that operation.
   */
  function addOperation(name, func) {
    operations.push({ name: name, func: func });
  }


  /**
   * applyOperations applies a series of predefined array-like operations to the provided element.
   * These operations have been stored in the `operations` array and are applied in the order in which 
   * they were added. Each operation is expected to have a `name` property indicating its type 
   * (e.g., "forEach", "map") and a `func` property with the actual function to apply.
   * 
   * @param {HTMLElement} element - The DOM element to which the operations will be applied.
   */
  function applyOperations(element) {
    // Create an array with the provided element. This is necessary because the operations 
    // (like forEach or map) are array methods and we need to apply them in an array context.
    var elementArray = [element];

    // Use the `reduce` method to apply each operation in sequence. The `reduce` method 
    // accumulates a result by applying a function that you provide to each member of 
    // the array, from left to right.
    // Here, for each operation, we apply the operation's function to the accumulated result (prev).
    operations.reduce(function (prev, operation) {

      // Using the `apply` method to call the array method represented by operation.name 
      // (e.g., "forEach") on the accumulated result with the arguments specified in operation.func.
      return Array.prototype[operation.name].apply(prev, operation.func);

    }, elementArray);  // The elementArray is used as the initial value for the accumulation in reduce.
  }


  // Check if a MutationObserver instance has already been created for the `querySelectorPerpetual` function.
  // This is to ensure that only one observer is created and we don't duplicate event handlers.
  if (!querySelectorPerpetual.observer) {

    // Create a new MutationObserver. The MutationObserver provides a way to watch for changes 
    // in the DOM, such as additions or deletions of nodes.
    querySelectorPerpetual.observer = new MutationObserver(function (mutations) {

      // For each mutation that has occurred (this can be multiple if many changes happen at once), 
      // process each mutation record.
      mutations.forEach(function (mutation) {

        // For each node that has been added to the DOM as part of this mutation, process it.
        Array.prototype.forEach.call(mutation.addedNodes, function (node) {

          // Check two things:
          // 1. If the node is an ELEMENT_NODE, meaning it's an actual element and not 
          //    a text or comment node.
          // 2. If the node matches the specified selector.
          if (node.nodeType === Node.ELEMENT_NODE && node.matches(selector)) {

            // Check two conditions:
            // 1. If the 'matchReappearance' option is false, which means we should 
            //    ignore elements that we've processed before.
            // 2. If the node is already in the 'elementInvocationMap', indicating 
            //    it's been processed before.
            // If both conditions are met, we simply return without doing anything further.
            if (!options.matchReappearance && elementInvocationMap.get(node)) {
              return;
            }

            // Mark the current node as processed by adding it to the 'elementInvocationMap' 
            // with a value of true.
            elementInvocationMap.set(node, true);

            // Apply all the stored operations to the current node.
            applyOperations(node);
          }
        });
      });
    });

    // Start observing the `target` (usually the body) for mutations. Specifically, we're 
    // looking for changes to the child list (i.e., nodes being added or removed) and in 
    // the entire subtree (i.e., all descendants of the target).
    querySelectorPerpetual.observer.observe(target, {
      childList: true,
      subtree: true
    });
  }


  // Check if the 'matchExisting' option is true. If true, this means we should look at current 
  // DOM elements that match the selector and apply operations to them.
  if (options.matchExisting) {

    // For each element in the document that matches the provided selector, 
    // execute the provided function.
    // The 'Array.prototype.forEach.call' is a technique to call 'forEach' on an array-like 
    // object, in this case, the NodeList returned by 'querySelectorAll'.
    Array.prototype.forEach.call(document.querySelectorAll(selector), function (element) {

      // Check two things:
      // 1. If the 'matchReappearance' option is false, which means we should ignore 
      //    elements that we've processed before.
      // 2. If the element is already in the 'elementInvocationMap', which means it's 
      //    been processed before.
      // If both conditions are met, we simply return without doing anything further.
      if (!options.matchReappearance && elementInvocationMap.get(element)) {
        return;
      }

      // Mark the current element as processed by adding it to the 'elementInvocationMap' 
      // with a value of true.
      elementInvocationMap.set(element, true);

      // Apply all the stored operations to the current element.
      applyOperations(element);
    });
  }


  return {
    // forEach method allows the user to apply a custom function to each matched DOM element.
    // It makes use of the addOperation helper to store the user-provided function and the type of operation.
    forEach: function (func) {
      // Add the provided function to the operations array with the type "forEach".
      // This indicates that for each matched DOM element, the function will be applied.
      addOperation("forEach", func);

      // Return the current object, allowing the methods to be chainable.
      // This means after calling this method, other methods on the object can be called immediately.
      return this;
    },
    // map method allows the user to transform each matched DOM element.
    // The provided function should return the transformed value.
    map: function (func) {
      // Add the provided transformation function to the operations array with the type "map".
      addOperation("map", func);

      // Return the current object for method chaining.
      return this;
    },
    // filter method allows the user to selectively include matched DOM elements based on a predicate function.
    // The provided function should return a boolean. If true, the element is kept, otherwise, it's excluded.
    filter: function (func) {
      // Add the provided predicate function to the operations array with the type "filter".
      addOperation("filter", func);

      // Return the current object for method chaining.
      return this;
    },
    // sort method allows the user to specify an order for the matched DOM elements.
    // The provided function should compare two elements and return a number indicating their order.
    sort: function (func) {
      // Add the provided comparison function to the operations array with the type "sort".
      addOperation("sort", func);

      // Return the current object for method chaining.
      return this;
    }
  };

}

// Add the querySelectorPerpetual function to the Document and Element prototypes, passing the current element as the root element.

Document.prototype.querySelectorPerpetual = function (selector, options) {
  return querySelectorPerpetual(selector, Object.assign(options || {}, { rootElement: this }));
};

Element.prototype.querySelectorPerpetual = function (selector, options) {
  return querySelectorPerpetual(selector, Object.assign(options || {}, { rootElement: this }));
};

