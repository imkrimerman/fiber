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
  './src/Foundation/Events.js',
  './src/Foundation/BaseClass.js',
  './src/Foundation/Log.js',
  './src/Foundation/Monitor.js',
  './src/Foundation/Type.js',
  // Contracts
  './src/Contracts/Contract.js',
  './src/Contracts/Access.js',
  './src/Contracts/Events.js',
  './src/Contracts/Serialize.js',
  './src/Contracts/StorageAdapter.js',
  // Base classes
  './src/Foundation/Class.js',
  './src/Foundation/Bag.js',
  './src/Foundation/ErrorBag.js',
  './src/Foundation/Extension.js',
  // Inversion of control Container
  './src/Container.js',
  // Extensions
  './src/Extensions/Events.js',
  './src/Extensions/Access.js',
  './src/Extensions/Binder.js',
  './src/Extensions/Extend.js',
  './src/Extensions/Extensions.js',
  './src/Extensions/OwnProps.js',
  './src/Extensions/Serialize.js',
  // Sync
  './src/Sync/Request.js',
  './src/Sync/Response.js',
  './src/Sync/Sync.js',
  // Mocks integration
  './src/Mocks/Transmitter.js',
  // Storage
  './src/Storage/Storage.js',
  './src/Storage/Adapter.js',
  './src/Storage/Server.js',
  './src/Storage/Local.js',
  // Base component classes
  './src/Foundation/Model.js',
  './src/Foundation/Collection.js',
  './src/Foundation/Collections/LinkedViews.js',
  './src/Foundation/Collections/Listeners.js',
  './src/Foundation/Collections/RouterCollection.js',
  // Command bus
  './src/Commands/Registry.js',
  './src/Commands/Command.js',
  './src/Commands/Handler.js',
  './src/Commands/Hub.js',
  // Fiber components
  './src/Object.js',
  './src/Model.js',
  './src/Collection.js',
  './src/Views.js',
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
