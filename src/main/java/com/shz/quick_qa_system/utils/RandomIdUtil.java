package com.shz.quick_qa_system.utils;

import java.security.SecureRandom;
import java.util.concurrent.ThreadLocalRandom;

/**
 * 基于问卷ID/提交ID等信息生成随机正整数ID，减少顺序可见性与碰撞概率。
 */
public final class RandomIdUtil {

	private static final SecureRandom SECURE_RANDOM = new SecureRandom();

	private RandomIdUtil() {}

	/**
	 * 生成提交记录ID：基于问卷ID混合时间与随机数，返回正整数。
	 */
	public static int generateSubmissionId(int questionnaireId) {
		int r1 = ThreadLocalRandom.current().nextInt();
		int r2 = SECURE_RANDOM.nextInt();
		long mix = ((long) questionnaireId << 32) ^ System.nanoTime() ^ r1 ^ r2;
		int id = (int) (mix ^ (mix >>> 32));
		if (id == 0) id = 1;
		return id == Integer.MIN_VALUE ? 1 : Math.abs(id);
	}

	/**
	 * 生成答案ID：基于提交ID、问题ID与序号混合，返回正整数。
	 */
	public static int generateAnswerId(int submissionId, int questionId, int index) {
		long mix = ((long) submissionId << 32) ^ ((long) questionId << 16) ^ System.nanoTime()
			^ ThreadLocalRandom.current().nextInt() ^ index;
		int id = (int) (mix ^ (mix >>> 32));
		if (id == 0) id = 2;
		return id == Integer.MIN_VALUE ? 2 : Math.abs(id);
	}
}


