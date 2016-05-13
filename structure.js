'use strict';

/**
 * Fiber build structure
 * @type {Array.<string>}
 */
module.exports = [
  // Properties and functions
  './src/Support/Properties.js',
  './src/Support/Version.js',
  './src/Support/Compatibility.js',
  './src/Support/fn.js',
  './src/Support/Macros.js',
  './src/Support/Descriptor.js',
  './src/Support/Cast.js',
  './src/Support/Class.js',
  './src/Support/Delegator.js',
  './src/Support/DeepProps.js',
  './src/Support/Extensions.js',
  './src/Support/Template.js',
  './src/Support/Validation.js',
  './src/Support/Computed.js',
  './src/Support/Compose.js',
  './src/Support/Injection.js',
  './src/Support/RegExp.js',
  './src/Support/Types.js',
  // Core
  './src/Core.js',
  // Base tools
  './src/Base/Events.js',
  './src/Base/BaseClass.js',
  './src/Base/Log.js',
  './src/Base/Monitor.js',
  './src/Base/Type.js',
  // Contracts
  './src/Contracts/Contract.js',
  './src/Contracts/Access.js',
  './src/Contracts/Events.js',
  // Base classes
  './src/Base/Class.js',
  './src/Base/Bag.js',
  './src/Base/ErrorBag.js',
  './src/Base/Request.js',
  './src/Base/Extension.js',
  './src/Base/Storage.js',
  // Inversion of control Container
  './src/Container.js',
  // Extensions
  './src/Extensions/Events.js',
  './src/Extensions/Access.js',
  './src/Extensions/Binder.js',
  './src/Extensions/Extend.js',
  './src/Extensions/Extensions.js',
  './src/Extensions/OwnProps.js',
  // Mocks integration
  './src/Mocks/Transmitter.js',
  // Base component classes
  './src/Base/Model.js',
  './src/Base/Collection.js',
  './src/Base/Collections/LinkedViews.js',
  './src/Base/Collections/Listeners.js',
  './src/Base/Collections/RouterCollection.js',
  // Command bus
  './src/Commands/Registry.js',
  './src/Commands/Command.js',
  './src/Commands/Handler.js',
  './src/Commands/Hub.js',
  // Fiber components
  './src/Object.js',
  './src/Model.js',
  './src/Collection.js',
  './src/ViewsManager.js',
  './src/View.js',
  './src/CollectionView.js',
  './src/Layout.js',
  // Routing
  './src/Routing/HistoryItem.js',
  './src/Routing/HistoryCollection.js',
  './src/Routing/Route.js',
  './src/Routing/RouteCollection.js',
  './src/Routing/Middleware.js',
  './src/Routing/MiddlewareCollection.js',
  './src/Routing/Router.js',
  // Application
  './src/Viewport.js',
  './src/Application.js',
];
