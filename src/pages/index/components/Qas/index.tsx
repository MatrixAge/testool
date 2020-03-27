import React, { memo, useState, useEffect } from 'react'
import { useIntl } from 'umi'
import { Tag, Rate, Button, Empty } from 'antd'
import {
	CheckOutlined,
	StarOutlined,
	EditOutlined,
	UpCircleOutlined,
	DownCircleOutlined,
	CheckCircleOutlined,
	PlusOutlined,
	LoadingOutlined
} from '@ant-design/icons'
import { List, AutoSizer, WindowScroller, CellMeasurer, CellMeasurerCache } from 'react-virtualized'
import { useBottomScrollListener } from 'react-bottom-scroll-listener'
import { IQas } from '@/db/models/Qas'
import { IORate } from '../../index'
import styles from './index.less'

interface IQa extends IQas {
	index: number
	style: any
	ref: any
	measure: () => any
	rate: (params: IORate) => void
}

const Qa = (props: IQa) => {
	const { id, index, question, answer, tags, rates, style, ref, measure, rate } = props
	const [ state_answer_visible, setStateAnswerVisible ] = useState(false)
	const [ state_rate, setStateRate ] = useState(5)
	const lang = useIntl()

	useEffect(
		() => {
			measure()
		},
		[ state_answer_visible ]
	)

	let avarage_rate: number = 0

	rates.map((item) => {
		avarage_rate = avarage_rate + item.rate
	})

	avarage_rate = avarage_rate / rates.length

	return (
		<div ref={ref} className='w_100 border_box' style={style}>
			<div className={`${styles.qa_item} w_100 border_box flex flex_column`}>
				<div className='question w_100 border_box flex flex_column'>
					<div className='q_head q_item w_100 border_box flex justify_between'>
						<div className='left flex align_center'>
							<div className='head_item flex align_center mr_16'>
								<CheckOutlined />
								<span className='text ml_4'>{rates.length}</span>
							</div>
							<div className='head_item flex align_center'>
								<StarOutlined />
								<span className='text ml_4'>
									{avarage_rate ? avarage_rate.toFixed(2) : 0}
								</span>
							</div>
						</div>
						<div className='right flex align_center'>
							<div className='icon_wrap flex justify_center align_center transition_normal cursor_point'>
								<EditOutlined />
							</div>
						</div>
					</div>
					<div className='q_body q_item w_100 border_box text_justify'>
						{question}
					</div>
					<div className='q_foot q_item w_100 border_box flex justify_between align_center'>
						<div className='tags flex'>
							{tags.map((item, index) => (
								<Tag style={{ fontSize: '10px' }} key={index}>
									{item}
								</Tag>
							))}
						</div>
						{state_answer_visible ? (
							<div
								className='icon_wrap flex justify_center align_center transition_normal cursor_point'
								onClick={() => {
									setStateAnswerVisible(false)
								}}
							>
								<UpCircleOutlined />
							</div>
						) : (
							<div
								className='icon_wrap flex justify_center align_center transition_normal cursor_point'
								onClick={() => {
									setStateAnswerVisible(true)
								}}
							>
								<DownCircleOutlined />
							</div>
						)}
					</div>
				</div>
				{state_answer_visible && (
					<div
						className={`${styles.answer} w_100 border_box flex flex_column transition_normal`}
					>
						<div
							className={`${styles.content} w_100 border_box text_justify`}
						>
							{answer}
						</div>
						<div className='a_foot w_100 border_box flex justify_between align_center'>
							<div className='left'>
								<Rate
									allowHalf
									defaultValue={state_rate}
									onChange={(v) => {
										setStateRate(v)
									}}
								/>
							</div>
							<div className='right'>
								<Button
									className='mr_12'
									icon={<UpCircleOutlined />}
									onClick={() => {
										setStateAnswerVisible(false)
									}}
								/>
								<Button
									type='primary'
									icon={<CheckCircleOutlined />}
									onClick={() => {
										rate({ id, rate: state_rate, index })
									}}
								>
									{lang.formatMessage({ id: 'index.btn_pass' })}
								</Button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

interface IProps {
	loading: boolean
	no_more: boolean
	qas: Array<IQas>
	groups: Array<string>
	current_group: string
	dispatch: (params: any) => void
	onAddGroup: () => void
	rate: (params: IORate) => void
}

const Index = (props: IProps) => {
	const { dispatch, loading, no_more, qas, groups, onAddGroup, rate, current_group } = props
	const [ state_page, setStatePage ] = useState(1)
	const lang = useIntl()

	const cache = new CellMeasurerCache()

	const rowRenderer = ({ index, parent, key, style }) => {
		const item = qas[index]

		return (
			<CellMeasurer
				cache={cache}
				parent={parent}
				rowIndex={index}
				key={key}
				style={{ marginBottom: '20px' }}
			>
				{({ registerChild, measure }) => (
					<Qa
						index={index}
						ref={registerChild}
						measure={measure}
						{...item}
						rate={rate}
						style={style}
					/>
				)}
			</CellMeasurer>
		)
	}

	const onBottom = () => {
		if (no_more || loading) return

		dispatch({
			type: 'index/loadMore',
			payload: {
				current_group,
				page: state_page + 1
			}
		})

		setStatePage(state_page + 1)
	}

	useBottomScrollListener(onBottom, 1000, 0)

	return (
		<div className={`${styles._local} w_100`}>
			{groups.length > 0 ? (
				<div className='w_100 border_box flex flex_column'>
					<WindowScroller>
						{({ height, isScrolling, onChildScroll, scrollTop }) => (
							<AutoSizer disableHeight>
								{({ width }) => (
									<List
										autoHeight
										width={width}
										height={height}
										rowCount={qas.length}
										deferredMeasurementCache={cache}
										rowHeight={cache.rowHeight}
										rowRenderer={rowRenderer}
										isScrolling={isScrolling}
										onScroll={onChildScroll}
										scrollTop={scrollTop}
									/>
								)}
							</AutoSizer>
						)}
					</WindowScroller>
					{loading && (
						<div className='loading_more w_100 border_box pt_30 pb_30 flex justify_center'>
							<LoadingOutlined
								className='loading'
								style={{ fontSize: '24px' }}
							/>
						</div>
					)}
					{no_more && (
						<div className='loading_more w_100 border_box pt_30 pb_30 flex justify_center'>
							<span className='color_aaa'>
								{lang.formatMessage({ id: 'index.no_more' })}
							</span>
						</div>
					)}
				</div>
			) : (
				<div className='empty_wrap flex flex_column justify_center align_center'>
					<Empty description={false} />
					<Button
						className='mt_12'
						type='primary'
						icon={<PlusOutlined />}
						onClick={onAddGroup}
					>
						{lang.formatMessage({ id: 'index.btn_add' })}
					</Button>
				</div>
			)}
		</div>
	)
}

export default memo(Index)