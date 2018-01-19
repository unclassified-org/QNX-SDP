/**
 * Common constants to share between client layer and server layer
 *
 * @author mlytvynyuk
 * $Id:$
 */

module.exports = {
	BASE_URL:'https://api.box.com/2.0',
	FOLDERS:'/folders',
	FOLDERS_ITEMS:'/folders/{id}/items',
	FOLDERS_COLLAB:'/folders/{id}/collaborations',
	FILES:'/files',
	FILES_CONTENT:'/files/{id}/content',
	FILES_VERSIONS:'/files/{id}/versions',
	SHARED_ITEMS:'/shared_items',
	COMMENTS:'/comments',
	DISCUSSIONS:'/discussions',
	COLLABORATIONS:'/collaborations',
	SEARCH:'/search',
	EVENTS:'/events',
	USERS:'/users',
	TOKENS:'/tokens',

	AUTH_URL:'https://api.box.com/oauth2/authorize',
	TOKEN_URL:'https://api.box.com/oauth2/token',

	PROTOCOL: 'qnxbox://'
}
