'use strict';

const validator = require('validator');

const meta = require('../meta');
const groups = require('../groups');
const user = require('../user');
const helpers = require('./helpers');
const pagination = require('../pagination');
const privileges = require('../privileges');

const groupsController = module.exports;

groupsController.list = async function (req, res) {
	const sort = req.query.sort || 'alpha';

	const data = await groupsController.getGroupsFromSet(req.uid, sort, 0, 14);
	data.title = '[[pages:groups]]';
	data.breadcrumbs = helpers.buildBreadcrumbs([{ text: '[[pages:groups]]' }]);
	res.render('groups/list', data);
};

groupsController.getGroupsFromSet = async function (uid, sort, start, stop) {
	let set = 'groups:visible:name';
	if (sort === 'count') {
		set = 'groups:visible:memberCount';
	} else if (sort === 'date') {
		set = 'groups:visible:createtime';
	}
	const [groupsData, allowGroupCreation] = await Promise.all([
		groups.getGroupsFromSet(set, uid, start, stop),
		privileges.global.can('group:create', uid),
	]);
	return {
		groups: groupsData,
		allowGroupCreation: allowGroupCreation,
		nextStart: stop + 1,
	};
};

groupsController.details = async function (req, res, next) {
	const groupName = await groups.getGroupNameByGroupSlug(req.params.slug);
	if (!groupName) {
		return next();
	}
	const [exists, isHidden] = await Promise.all([
		groups.exists(groupName),
		groups.isHidden(groupName),
	]);
	if (!exists) {
		return next();
	}
	if (isHidden) {
		const [isMember, isInvited] = await Promise.all([
			groups.isMember(req.uid, groupName),
			groups.isInvited(req.uid, groupName),
		]);
		if (!isMember && !isInvited) {
			return next();
		}
	}
	const [groupData, posts, isAdmin, isGlobalMod] = await Promise.all([
		groups.get(groupName, {
			uid: req.uid,
			truncateUserList: true,
			userListCount: 20,
		}),
		groups.getLatestMemberPosts(groupName, 10, req.uid),
		user.isAdministrator(req.uid),
		user.isGlobalModerator(req.uid),
	]);
	if (!groupData) {
		return next();
	}
	groupData.isOwner = groupData.isOwner || isAdmin || (isGlobalMod && !groupData.system);
	const results = {
		title: '[[pages:group, ' + groupData.displayName + ']]',
		group: groupData,
		posts: posts,
		isAdmin: isAdmin,
		isGlobalMod: isGlobalMod,
		allowPrivateGroups: meta.config.allowPrivateGroups,
		breadcrumbs: helpers.buildBreadcrumbs([{ text: '[[pages:groups]]', url: '/groups' }, { text: groupData.displayName }]),
	};

	res.render('groups/details', results);
};

groupsController.members = async function (req, res, next) {
	const page = parseInt(req.query.page, 10) || 1;
	const usersPerPage = 50;
	const start = Math.max(0, (page - 1) * usersPerPage);
	const stop = start + usersPerPage - 1;
	const groupName = await groups.getGroupNameByGroupSlug(req.params.slug);
	if (!groupName) {
		return next();
	}
	const [groupData, isAdminOrGlobalMod, isMember, isHidden] = await Promise.all([
		groups.getGroupData(groupName),
		user.isAdminOrGlobalMod(req.uid),
		groups.isMember(req.uid, groupName),
		groups.isHidden(groupName),
	]);

	if (isHidden && !isMember && !isAdminOrGlobalMod) {
		return next();
	}
	const users = await user.getUsersFromSet('group:' + groupName + ':members', req.uid, start, stop);

	const breadcrumbs = helpers.buildBreadcrumbs([
		{ text: '[[pages:groups]]', url: '/groups' },
		{ text: validator.escape(String(groupName)), url: '/groups/' + req.params.slug },
		{ text: '[[groups:details.members]]' },
	]);

	const pageCount = Math.max(1, Math.ceil(groupData.memberCount / usersPerPage));
	res.render('groups/members', {
		users: users,
		pagination: pagination.create(page, pageCount, req.query),
		breadcrumbs: breadcrumbs,
	});
};

groupsController.uploadCover = async function (req, res, next) {
	var params = JSON.parse(req.body.params);

	try {
		const isOwner = await groups.ownership.isOwner(req.uid, params.groupName);
		if (!isOwner) {
			throw new Error('[[error:no-privileges]]');
		}
		const image = await groups.updateCover(req.uid, {
			file: req.files.files[0].path,
			groupName: params.groupName,
		});
		res.json([{ url: image.url }]);
	} catch (err) {
		next(err);
	}
};

require('../promisify')(groupsController, ['list', 'details', 'members', 'uploadCover']);
